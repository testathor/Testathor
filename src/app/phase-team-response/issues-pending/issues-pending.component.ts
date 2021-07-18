import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Issue, STATUS } from '../../core/models/issue.model';
import { UserRole } from '../../core/models/user.model';
import { IssueService } from '../../core/services/issue.service';
import { PermissionService } from '../../core/services/permission.service';
import { UserService } from '../../core/services/user.service';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit, OnChanges {
  displayedColumns;
  filter: (issue: Issue) => boolean;

  readonly actionButtons: ACTION_BUTTONS[] = [
    ACTION_BUTTONS.VIEW_IN_WEB,
    ACTION_BUTTONS.RESPOND_TO_ISSUE,
    ACTION_BUTTONS.MARK_AS_RESPONDED,
    ACTION_BUTTONS.FIX_ISSUE
  ];

  @Input() teamFilter: string;

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public issueService: IssueService,
              public permissions: PermissionService, public userService: UserService) {
    if (userService.currentUser.role !== UserRole.Student) {
      this.displayedColumns = [
        TABLE_COLUMNS.ID,
        TABLE_COLUMNS.TITLE,
        TABLE_COLUMNS.TEAM_ASSIGNED,
        TABLE_COLUMNS.TYPE,
        TABLE_COLUMNS.SEVERITY,
        TABLE_COLUMNS.DUPLICATED_ISSUES,
        TABLE_COLUMNS.ACTIONS
      ];
    } else {
      this.displayedColumns = [
        TABLE_COLUMNS.ID,
        TABLE_COLUMNS.TITLE,
        TABLE_COLUMNS.TYPE,
        TABLE_COLUMNS.SEVERITY,
        TABLE_COLUMNS.DUPLICATED_ISSUES,
        TABLE_COLUMNS.ACTIONS
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.table.issues.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    const isNotDuplicate = (issue: Issue) => !issue.duplicateOf;
    const doesNotHaveFinalisedResponse = (issue: Issue) =>
        (!this.issueService.hasTeamResponse(issue.id) || (!issue.status || issue.status === STATUS.Incomplete));
    this.filter = (issue: Issue) => doesNotHaveFinalisedResponse(issue) && isNotDuplicate(issue);
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
