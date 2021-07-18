import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Issue } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-duplicated-issues-component',
  templateUrl: './duplicated-issues.component.html',
  styleUrls: ['./duplicated-issues.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DuplicatedIssuesComponent implements OnInit {
  duplicatedIssues: Observable<Issue[]>;

  @Input() issue: Issue;

  constructor(public issueService: IssueService,
              public errorHandlingService: ErrorHandlingService,
              public phaseService: PhaseService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.duplicatedIssues = this.issueService.getDuplicateIssuesFor(this.issue);
  }

  removeDuplicateStatus(duplicatedIssue: Issue) {
    const latestIssue = this.getUpdatedIssueWithRemovedDuplicate(duplicatedIssue);
    this.issueService.updateIssueWithComment(latestIssue, latestIssue.issueComment).subscribe(
      (issue) => this.issueService.updateLocalStore(issue),
      (error) => this.errorHandlingService.handleError(error)
    );
  }

  getUpdatedIssueWithRemovedDuplicate(duplicatedIssue: Issue): Issue {
    const clone = duplicatedIssue.clone(this.phaseService.currentPhase);
    clone.duplicated = false;
    clone.duplicateOf = null;
    clone.issueComment.description = clone.createGithubTeamResponse();
    return clone;
  }
}
