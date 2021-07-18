import { Component, OnInit, ViewChild } from '@angular/core';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-phase-bug-reporting',
  templateUrl: './phase-bug-reporting.component.html',
  styleUrls: ['./phase-bug-reporting.component.css']
})
export class PhaseBugReportingComponent implements OnInit {

  readonly displayedColumns = [
    TABLE_COLUMNS.ID,
    TABLE_COLUMNS.TITLE,
    TABLE_COLUMNS.TYPE,
    TABLE_COLUMNS.SEVERITY,
    TABLE_COLUMNS.ACTIONS
  ];
  readonly actionButtons: ACTION_BUTTONS[] = [
    ACTION_BUTTONS.VIEW_IN_WEB,
    ACTION_BUTTONS.DELETE_ISSUE,
    ACTION_BUTTONS.FIX_ISSUE
  ];

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public permissions: PermissionService,
              public userService: UserService) {
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
