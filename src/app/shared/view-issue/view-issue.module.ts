import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { IssueComponentsModule } from '../issue/issue-components.module';
import { LabelDropdownModule } from '../label-dropdown/label-dropdown.module';
import { SharedModule } from '../shared.module';
import { IssueDisputeModule } from './issue-dispute/issue-dispute.module';
import { NewTeamResponseModule } from './new-team-response/new-team-response.module';
import { TeamResponseModule } from './team-response/team-response.module';
import { TesterResponseModule } from './tester-response/tester-response.module';
import { ViewIssueComponent } from './view-issue.component';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    ViewIssueComponent
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    NewTeamResponseModule,
    TeamResponseModule,
    IssueDisputeModule,
    TesterResponseModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ]
})
export class ViewIssueModule { }
