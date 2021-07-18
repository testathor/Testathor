import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Issue } from '../../core/models/issue.model';
import { UserRole } from '../../core/models/user.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueService } from '../../core/services/issue.service';
import { PermissionService } from '../../core/services/permission.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';

export enum ISSUE_COMPONENTS {
  TESTER_POST,
  TEAM_RESPONSE,
  NEW_TEAM_RESPONSE,
  TESTER_RESPONSE,
  ISSUE_DISPUTE,
  SEVERITY_LABEL,
  TYPE_LABEL,
  RESPONSE_LABEL,
  ASSIGNEE,
  DUPLICATE,
  UNSURE_CHECKBOX
}

export const SUBMIT_BUTTON_TEXT = {
  SUBMIT: 'Submit',
  SAVE: 'Save',
  OVERWRITE: 'Overwrite',
};

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit, OnDestroy, OnChanges {
  issue: Issue;
  isIssueLoading = true;
  isTutorResponseEditing = false;
  isIssueDescriptionEditing = false;
  isTeamResponseEditing = false;
  isTesterResponseEditing = false;
  issueSubscription: Subscription;

  @Input() issueId: number;
  @Input() issueComponents: ISSUE_COMPONENTS[];

  public readonly issueComponentsEnum = ISSUE_COMPONENTS;
  public readonly userRole = UserRole;

  constructor(private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService,
              public userService: UserService,
              public issueService: IssueService,
              private phaseService: PhaseService) { }

  ngOnInit() {
    this.getAndPollIssue(this.issueId);
  }

  /**
   * Will be triggered when there is a change in issueId (e.g. there is a navigation from 1 issue page to another issue page)
   * @param changes - The changes being applied to @Input.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.issueId.firstChange) {
      this.stopPolling();
      this.isIssueLoading = true;
      this.getAndPollIssue(changes.issueId.currentValue);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  isComponentVisible(component: ISSUE_COMPONENTS): boolean {
    return this.issueComponents.includes(component);
  }

  isEditing(): boolean {
    return this.isIssueDescriptionEditing || this.isTutorResponseEditing || this.isTeamResponseEditing;
  }

  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(newIssue);
  }

  updateDescriptionEditState(updatedState: boolean) {
    this.isIssueDescriptionEditing = updatedState;
  }

  updateTeamResponseEditState(updatedState: boolean) {
    this.isTeamResponseEditing = updatedState;
  }

  updateTesterResponseEditState(updatedState: boolean) {
    this.isTesterResponseEditing = updatedState;
  }

  updateTutorResponseEditState(updatedState: boolean) {
    this.isTutorResponseEditing = updatedState;
  }

  private getAndPollIssue(id: number): void {
    this.issueService.getIssue(id).subscribe(
      (issue: Issue) => {
        this.isIssueLoading = false;
        this.issue = issue;
        this.pollIssue(id);
      },
      (err) => this.errorHandlingService.handleError(err)
    );
  }

  private pollIssue(id: number): void {
    this.issueSubscription = this.issueService.pollIssue(id).subscribe((issue: Issue) => {
      const updatedIssue = issue.clone(this.phaseService.currentPhase);
      if (!this.isIssueLoading) {
        // prevent updating of respective attributes while editing
        if (this.isIssueDescriptionEditing ||
            (this.isTeamResponseEditing || (!this.issue.teamResponse && updatedIssue.teamResponse)) ||
            this.isTesterResponseEditing || this.isTutorResponseEditing) {
          updatedIssue.retainResponses(this.phaseService.currentPhase, this.issue);
        }
      }
      this.issue = updatedIssue;
      this.isIssueLoading = false;
    }, (error) => {
      this.errorHandlingService.handleError(error, () => this.pollIssue(id));
    });
  }

  private stopPolling(): void {
    if (this.issueSubscription) {
      this.issueSubscription.unsubscribe();
    }
  }
}
