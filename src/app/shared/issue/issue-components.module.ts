import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { SharedModule } from '../shared.module';
import { AssigneeComponent } from './assignee/assignee.component';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { DescriptionComponent } from './description/description.component';
import { DuplicatedIssuesComponent } from './duplicatedIssues/duplicated-issues.component';
import { DuplicateOfComponent } from './duplicateOf/duplicate-of.component';
import { LabelComponent } from './label/label.component';
import { TitleComponent } from './title/title.component';
import { UnsureCheckboxComponent } from './unsure-checkbox/unsure-checkbox.component';

@NgModule({
  imports: [
    SharedModule,
    CommentEditorModule,
    MatProgressBarModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
    ConflictDialogComponent,
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
    ConflictDialogComponent,
  ],
  entryComponents: [
    ConflictDialogComponent,
  ]
})
export class IssueComponentsModule { }
