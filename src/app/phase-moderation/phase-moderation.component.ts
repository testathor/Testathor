import { Component, OnInit, ViewChild } from '@angular/core';
import { IssuesFilter } from '../core/models/issue.model';
import { Phase } from '../core/models/phase.model';
import { DataService } from '../core/services/data.service';
import { IssueService } from '../core/services/issue.service';
import { UserService } from '../core/services/user.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-phase-moderation',
  templateUrl: './phase-moderation.component.html',
  styleUrls: ['./phase-moderation.component.css']
})

export class PhaseModerationComponent implements OnInit {

  displayedColumns = [
    TABLE_COLUMNS.ID,
    TABLE_COLUMNS.TITLE,
    TABLE_COLUMNS.TYPE,
    TABLE_COLUMNS.SEVERITY,
    TABLE_COLUMNS.TODO,
    TABLE_COLUMNS.ACTIONS
  ];

  public teamFilter = 'All Teams';

  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.FIX_ISSUE];

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(private issueService: IssueService,
              public userService: UserService,
              private dataService: DataService) { }

  ngOnInit() {
    this.issueService.setIssueTeamFilter(this.teamFilter);
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }

  get teamList(): string[] {
    const teams = this.dataService.getTeams();
    switch (IssuesFilter[Phase.phaseModeration][this.userService.currentUser.role]) {
      case 'FILTER_BY_TEAM_ASSIGNED':
        return ['All Teams', ...this.userService.currentUser.allocatedTeams.map(team => team.id)];
      case 'NO_FILTER':
        return ['All Teams', ...teams];
      default:
        break;
    }
  }

  updateDisplayedTeam(newTeam: string) {
    this.teamFilter = newTeam;
    this.table.issues.teamFilter = this.teamFilter;
  }

}
