import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../shared/comment-editor/comment-editor.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { SharedModule } from '../shared/shared.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueComponent } from './issue/issue.component';
import { IssuesFaultyComponent } from './issues-faulty/issues-faulty.component';
import { IssuesPendingComponent } from './issues-pending/issues-pending.component';
import { IssuesRespondedComponent } from './issues-responded/issues-responded.component';
import { PhaseTeamResponseRoutingModule } from './phase-team-response-routing.module';
import { PhaseTeamResponseComponent } from './phase-team-response.component';

@NgModule({
  imports: [
    PhaseTeamResponseRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
  ],
  declarations: [
    PhaseTeamResponseComponent,
    IssueComponent,
    IssuesPendingComponent,
    IssuesRespondedComponent,
    IssuesFaultyComponent,
  ],
})
export class PhaseTeamResponseModule {}
