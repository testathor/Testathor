import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Issue } from '../../../core/models/issue.model';
import { Team } from '../../../core/models/team.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-assignee-component',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssigneeComponent implements OnInit {
  teamMembers: string[];
  isInEditMode = false;
  assignees: string[];

  @Input() issue: Issue;
  @Input() team: Team;
  @Input() isEditable = true;

  @ViewChild(MatSelect) assigneeSelection: MatSelect;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              private phaseService: PhaseService,
              public permissions: PermissionService) {
  }

  ngOnInit(): void {
    this.teamMembers = this.team.teamMembers.map((user) => user.loginId);
    this.assignees = this.issue.assignees.map(a => a.toLowerCase());
  }

  openSelector() {
    this.isInEditMode = true;
    this.assigneeSelection.open();
  }

  handleEditMode(isOpen) {
    if (!isOpen) {
      this.isInEditMode = false;
    }
  }

  updateAssignee(): void {
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.assignees = this.assignees;
    this.issueService.updateIssue(newIssue).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }
}
