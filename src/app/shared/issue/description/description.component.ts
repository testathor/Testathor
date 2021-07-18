import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { throwError } from 'rxjs';
import { finalize, flatMap, map } from 'rxjs/operators';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { Issue } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';
import { SUBMIT_BUTTON_TEXT } from '../../view-issue/view-issue.component';
import { ConflictDialogComponent } from '../conflict-dialog/conflict-dialog.component';

@Component({
  selector: 'app-issue-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
})
export class DescriptionComponent implements OnInit {
  isSavePending = false;
  issueDescriptionForm: FormGroup;
  conflict: Conflict;
  submitButtonText: string;

  @Input() issue: Issue;
  @Input() title: string;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() changeEditState = new EventEmitter<boolean>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private dialog: MatDialog,
              private phaseService: PhaseService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.issueDescriptionForm = this.formBuilder.group({
      description: [''],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.changeEditState.emit(true);
    this.issueDescriptionForm.setValue({
      description: this.issue['description'] || ''
    });
  }

  updateDescription(form: NgForm) {
    if (this.issueDescriptionForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return issue.description === this.issue.description;
      }),
      flatMap((isSaveToUpdate: boolean) => {
        if (isSaveToUpdate || this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return this.issueService.updateIssue(this.getUpdatedIssue());
        } else {
          this.conflict = new Conflict(this.issue.description, this.issueService.issues[this.issue.id].description);
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isSavePending = false)
    ).subscribe((editedIssue: Issue) => {
      this.issueUpdated.emit(editedIssue);
      this.resetToDefault();
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.conflict,
      autoFocus: false
    });
  }

  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.conflict = undefined;
    this.changeEditState.emit(false);
  }

  /**
   * When user exits exit mode, we will need to sync the issue in IssueService with this component.
   */
  cancelEditMode(): void {
    this.issueService.getIssue(this.issue.id).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    });
  }

  private getUpdatedIssue(): Issue {
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.description = Issue.updateDescription(this.issueDescriptionForm.get('description').value);
    return newIssue;
  }
}
