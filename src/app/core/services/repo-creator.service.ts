import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { flatMap, tap } from 'rxjs/operators';
import { Phase } from '../models/phase.model';
import { UserRole } from '../models/user.model';
import { GithubService } from './github.service';
import { SessionFixConfirmationComponent } from './session-fix-confirmation/session-fix-confirmation.component';
import { UserService } from './user.service';

export const MISSING_REQUIRED_REPO = 'You cannot proceed without the required repository.';
export const CURRENT_PHASE_REPO_CLOSED = 'Current Phase\'s Repository has not been opened.';
export const BUG_REPORTING_INVALID_ROLE =
  "'Bug-Reporting Phase\'s repository initialisation is only available to Students.'";


@Injectable({
  providedIn: 'root',
})
export class RepoCreatorService {
  constructor(
    private githubService: GithubService,
    private userService: UserService,
    private repoCreationConfirmationDialog: MatDialog
  ) {}

  /**
   * Prompts user to allow CATcher to create a repo, if repo does not
   * exist and current phase is the bug reporting phase.
   * @param currentPhase the current phase of the session.
   * @param phaseRepo the name of the specified repository.
   */
  public requestRepoCreationPermissions(currentPhase: Phase, phaseRepo: string):
    UnaryFunction<Observable<boolean>, Observable<boolean | null>> {
    return pipe(
      flatMap((isRepoPresent: boolean) => {
        if (!isRepoPresent && currentPhase === Phase.phaseBugReporting) {
          return this.openRepoCreationConfirmation(phaseRepo);
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Launches the SessionFixConfirmation Dialog.
   * @param phaseRepo the name of the specified repository.
   * @return Observable<boolean> - Representing user's permission grant.
   */
  private openRepoCreationConfirmation(phaseRepo: string): Observable<boolean> {
    const dialogRef: MatDialogRef<SessionFixConfirmationComponent> =
    this.repoCreationConfirmationDialog.open(SessionFixConfirmationComponent, {
      data: {user: this.userService.currentUser.loginId, repoName: phaseRepo}
    });
    return dialogRef.afterClosed();
  }

 /**
  * Checks if the current phase and current user role match the given permissions
  * for the user to create the phase repository if deemed necessary
  * @param currentPhase the current phase of the session.
  */
  public verifyRepoCreationPermissions(currentPhase: Phase):
    UnaryFunction<Observable<boolean | null>, Observable<boolean | null>> {
    return pipe(
      tap((repoCreationPermission: boolean | null) => {
        if (repoCreationPermission === null) {
          return;
        }

        if (repoCreationPermission === false) {
          throw new Error(MISSING_REQUIRED_REPO);
        } else if (currentPhase !== Phase.phaseBugReporting) {
          throw new Error(CURRENT_PHASE_REPO_CLOSED);
        } else if (this.userService.currentUser.role !== UserRole.Student) {
          throw new Error(BUG_REPORTING_INVALID_ROLE);
        }
      })
    );
  }

  /**
   * Attempts to create the repository if permissions have been given to do so.
   * @param phaseRepo the name of the specified repository.
   * @return - Dummy Observable to give the API sometime to propagate if the creation of the new
   *           repository is needed since the API Call used here does not return any response.
   */
  public attemptRepoCreation(phaseRepo: string):
    UnaryFunction<Observable<boolean | null>, Observable<boolean | null>> {
    return pipe(
      flatMap((repoCreationPermission: boolean | null) => {
        if (repoCreationPermission === null) {
          // No Session Fix Necessary
          return of(null);
        } else {
          this.githubService.createRepository(phaseRepo);
          return new Observable(subscriber => {
            setTimeout(() => subscriber.next(true), 1000);
          });
        }
      })
    );
  }

  /**
   * Checks if the specified repository has been created.
   * @param phaseOwner the user or organization holding the specified repository.
   * @param phaseRepo the name of the specified repository.
   */
  public verifyRepoCreation(phaseOwner: string, phaseRepo: string):
    UnaryFunction<Observable<boolean | null>, Observable<boolean>> {
    return pipe(
      flatMap((isFixAttempted: boolean | null) => {
        if (!isFixAttempted) {
          // If no fix has been attempted, there is no need to verify fix outcome.
          return of(true);
        } else {
          // Verify that Repository has been created if a fix attempt has occurred.
          return this.githubService.isRepositoryPresent(phaseOwner, phaseRepo);
        }
      })
    );
  }
}
