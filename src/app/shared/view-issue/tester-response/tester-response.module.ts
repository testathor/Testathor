import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../../comment-editor/comment-editor.module';
import { IssueComponentsModule } from '../../issue/issue-components.module';
import { LabelDropdownModule } from '../../label-dropdown/label-dropdown.module';
import { SharedModule } from '../../shared.module';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { TesterResponseComponent } from './tester-response.component';

@NgModule({
  exports: [
    TesterResponseComponent
  ],
  declarations: [
    TesterResponseComponent,
    ConflictDialogComponent
  ],
  entryComponents: [
    ConflictDialogComponent,
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ]
})
export class TesterResponseModule { }
