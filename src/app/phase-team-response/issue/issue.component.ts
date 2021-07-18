import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IssueService } from '../../core/services/issue.service';
import { PermissionService } from '../../core/services/permission.service';
import { ISSUE_COMPONENTS, ViewIssueComponent } from '../../shared/view-issue/view-issue.component';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  issueId: number;

  readonly issueComponents: ISSUE_COMPONENTS[] = [
    ISSUE_COMPONENTS.TESTER_POST,
    ISSUE_COMPONENTS.TEAM_RESPONSE,
    ISSUE_COMPONENTS.NEW_TEAM_RESPONSE,
    ISSUE_COMPONENTS.SEVERITY_LABEL,
    ISSUE_COMPONENTS.TYPE_LABEL,
    ISSUE_COMPONENTS.RESPONSE_LABEL,
    ISSUE_COMPONENTS.ASSIGNEE,
    ISSUE_COMPONENTS.DUPLICATE
  ];

  @ViewChild(ViewIssueComponent) viewIssue: ViewIssueComponent;

  constructor(public issueService: IssueService,
              private route: ActivatedRoute,
              public permissions: PermissionService) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.issueId = + params['issue_id'];
      }
    );
  }

  canDeactivate(): boolean {
    return !this.viewIssue.isEditing();
  }

}
