import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../../comment-editor/comment-editor.module';
import { IssueComponentsModule } from '../../issue/issue-components.module';
import { LabelDropdownModule } from '../../label-dropdown/label-dropdown.module';
import { SharedModule } from '../../shared.module';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { NewTeamResponseComponent } from './new-team-response.component';

@NgModule({
  exports: [
    NewTeamResponseComponent,
    ConflictDialogComponent,
  ],
  declarations: [
    NewTeamResponseComponent,
    ConflictDialogComponent,
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ],
  entryComponents: [
    ConflictDialogComponent,
  ]
})
export class NewTeamResponseModule { }
