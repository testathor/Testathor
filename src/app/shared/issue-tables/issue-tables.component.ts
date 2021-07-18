import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Issue, STATUS } from '../../core/models/issue.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';
import { IssueService } from '../../core/services/issue.service';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';
import { PermissionService } from '../../core/services/permission.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';
import { IssuesDataTable } from './IssuesDataTable';

export enum ACTION_BUTTONS {
  VIEW_IN_WEB,
  MARK_AS_RESPONDED,
  MARK_AS_PENDING,
  RESPOND_TO_ISSUE,
  FIX_ISSUE,
  DELETE_ISSUE
}

@Component({
  selector: 'app-issue-tables',
  templateUrl: './issue-tables.component.html',
  styleUrls: ['./issue-tables.component.css']
})
export class IssueTablesComponent implements OnInit, AfterViewInit {

  @Input() headers: string[];
  @Input() actions: ACTION_BUTTONS[];
  @Input() filters?: any = undefined;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  issues: IssuesDataTable;
  issuesPendingDeletion: {[id: number]: boolean};
  public readonly action_buttons = ACTION_BUTTONS;

  constructor(public userService: UserService,
              public permissions: PermissionService,
              public labelService: LabelService,
              private githubService: GithubService,
              public issueService: IssueService,
              private phaseService: PhaseService,
              private errorHandlingService: ErrorHandlingService,
              private loggingService: LoggingService) { }

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.sort,
      this.paginator, this.headers, this.filters);
    this.issuesPendingDeletion = {};
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
    });
  }

  /**
   * Formats the title text to account for those that contain long words.
   * @param title - Title of Issue that is to be displayed in the Table Row.
   */
  fitTitleText(title: string): string {

    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_WORD_LENGTH = 43;
    const SPLITTER_TEXT = ' ';
    const ELLIPSES = '...';

    return title.split(SPLITTER_TEXT).map(word => {
      if (word.length > MAX_WORD_LENGTH) {
        return word.substring(0, MAX_WORD_LENGTH - 5).concat(ELLIPSES);
      }
      return word;
    }).join(SPLITTER_TEXT);
  }

  isActionVisible(action: ACTION_BUTTONS): boolean {
    return this.actions.includes(action);
  }

  markAsResponded(issue: Issue) {
    this.loggingService.info(`IssueTablesComponent: Marking Issue ${issue.id} as Responded`);
    const newIssue = issue.clone(this.phaseService.currentPhase);
    newIssue.status = STATUS.Done;
    this.issueService.updateIssue(newIssue).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }

  isResponseEditable() {
    return this.permissions.isTeamResponseEditable() || this.permissions.isTesterResponseEditable();
  }

  markAsPending(issue: Issue) {
    this.loggingService.info(`IssueTablesComponent: Marking Issue ${issue.id} as Pending`);
    const newIssue = issue.clone(this.phaseService.currentPhase);
    newIssue.status = STATUS.Incomplete;
    this.issueService.updateIssue(newIssue).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }

  logIssueRespondRouting(id: number) {
    this.loggingService.info(`IssueTablesComponent: Proceeding to Respond to Issue ${id}`);
  }

  logIssueEditRouting(id: number) {
    this.loggingService.info(`IssueTablesComponent: Proceeding to Edit Issue ${id}`);
  }

  /**
   * Gets the number of resolved disputes.
   */
  todoFinished(issue: Issue): number {
    return issue.issueDisputes.length - issue.numOfUnresolvedDisputes();
  }

  /**
   * Checks if all the disputes are resolved.
   */
  isTodoListChecked(issue: Issue): boolean {
    return issue.issueDisputes && issue.numOfUnresolvedDisputes() === 0;
  }

  viewIssueInBrowser(id: number) {
    this.loggingService.info(`IssueTablesComponent: Opening Issue ${id} on Github`);
    this.githubService.viewIssueInBrowser(id);
  }

  deleteIssue(id: number) {
    this.loggingService.info(`IssueTablesComponent: Deleting Issue ${id}`);
    this.issuesPendingDeletion = {
      ...this.issuesPendingDeletion,
      [id]: true,
    };
    this.issueService.deleteIssue(id).pipe(finalize(() => {
      const { [id]: issueRemoved, ...theRest } = this.issuesPendingDeletion;
      this.issuesPendingDeletion = theRest;
    })).subscribe((removedIssue) => {
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }
}
