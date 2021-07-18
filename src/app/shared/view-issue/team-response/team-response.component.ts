import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { finalize, flatMap, map } from 'rxjs/operators';
import { IssueComment } from '../../../core/models/comment.model';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { Issue, STATUS } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';
import { ConflictDialogComponent } from '../../issue/conflict-dialog/conflict-dialog.component';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';

@Component({
  selector: 'app-team-response',
  templateUrl: './team-response.component.html',
  styleUrls: ['./team-response.component.css'],
})
export class TeamResponseComponent implements OnInit {
  isSavePending = false;
  responseForm: FormGroup;
  conflict: Conflict;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private dialog: MatDialog,
              private phaseService: PhaseService) {
  }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      description: [''],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
    this.responseForm.setValue({
      description: this.issue.teamResponse || '',
    });
  }

  updateResponse(form: NgForm) {
    if (this.responseForm.invalid) {
      return;
    }
    this.isSavePending = true;

    const updatedIssue = this.getUpdatedIssue();
    const updatedIssueComment = <IssueComment>{
      ...updatedIssue.issueComment,
      description: updatedIssue.createGithubTeamResponse(),
    };

    this.isSafeToUpdate().pipe(
      flatMap((isSaveToUpdate: boolean) => {
        if (isSaveToUpdate || this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return this.issueService.updateIssueWithComment(updatedIssue, updatedIssueComment);
        } else if (this.isUpdatingDeletedResponse()) {
          return this.issueService.createTeamResponse(updatedIssue);
        } else {
          this.conflict = new Conflict(this.issue.teamResponse, this.issueService.issues[this.issue.id].teamResponse);
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isSavePending = false)
    ).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      this.resetToDefault();
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  /**
   * @return - Determines whether it is safe to updated an existing team response.
   */
  isSafeToUpdate(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return issue.teamResponse === this.issue.teamResponse;
      })
    );
  }

  /**
   * Determines whether the user is updating a response that has already been deleted on Github.
   */
  isUpdatingDeletedResponse(): boolean {
    return this.issue.teamResponse && !this.issueService.issues[this.issue.id].teamResponse;
  }

  canEditIssue(): boolean {
    return this.permissions.isTeamResponseEditable();
  }

  /**
   * Resets to default form state.
   */
  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.conflict = undefined;
    this.updateEditState.emit(false);
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.conflict,
      autoFocus: false
    });
  }

  /**
   * When user exits exit mode, we will need to sync the issue in IssueService with this component.
   */
  cancelEditMode(): void {
    this.issueService.getIssue(this.issue.id).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    });
  }

  private getUpdatedIssue(): Issue {
    const clone = this.issue.clone(this.phaseService.currentPhase);
    clone.teamResponse = Issue.updateTeamResponse(this.responseForm.get('description').value);
    if (!clone.status) {
      clone.status = clone.teamResponse === '' ? STATUS.Incomplete : STATUS.Done;
    }
    return clone;
  }
}
