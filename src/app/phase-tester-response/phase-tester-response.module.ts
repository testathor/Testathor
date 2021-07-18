import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { SharedModule } from '../shared/shared.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssuePendingComponent } from './issue-pending/issue-pending.component';
import { IssueRespondedComponent } from './issue-responded/issue-responded.component';
import { IssueComponent } from './issue/issue.component';
import { PhaseTesterResponseRoutingModule } from './phase-tester-response-routing.module';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';

@NgModule({
  exports: [PhaseTesterResponseComponent],
  declarations: [
    PhaseTesterResponseComponent,
    IssueComponent,
    IssuePendingComponent,
    IssueRespondedComponent
  ],
  imports: [
    CommonModule,
    PhaseTesterResponseRoutingModule,
    SharedModule,
    ViewIssueModule,
    IssueTablesModule,
    MarkdownModule.forChild()
  ]
})
export class PhaseTesterResponseModule { }
