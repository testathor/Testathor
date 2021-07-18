import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { finalize, flatMap, map } from 'rxjs/operators';
import { IssueComment } from '../../../core/models/comment.model';
import { Issue } from '../../../core/models/issue.model';
import { TesterResponse } from '../../../core/models/tester-response.model';
import { UserRole } from '../../../core/models/user.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PhaseService } from '../../../core/services/phase.service';
import { UserService } from '../../../core/services/user.service';
import { CommentEditorComponent } from '../../comment-editor/comment-editor.component';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';
import { ConflictDialogComponent, TesterResponseConflictData } from './conflict-dialog/conflict-dialog.component';

@Component({
  selector: 'app-tester-response',
  templateUrl: './tester-response.component.html',
  styleUrls: ['./tester-response.component.css']
})
export class TesterResponseComponent implements OnInit, OnChanges {
  testerResponseForm: FormGroup;
  isFormPending = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  private readonly responseRadioIdentifier = 'response-radio';
  private readonly responseTextIdentifier = 'tester-response';

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService,
              private dialog: MatDialog,
              private phaseService: PhaseService) { }

  ngOnInit() {
    this.resetForm();
    this.submitButtonText = this.isNewResponse() ? SUBMIT_BUTTON_TEXT.SUBMIT : SUBMIT_BUTTON_TEXT.SAVE;
    setTimeout(() => {
      this.updateEditState.emit(this.isNewResponse());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Whenever there is a change in value of issue, we reset the form so to render the most up to date form.
    if (!this.isEditing && changes.issue && changes.issue.previousValue !== changes.issue.currentValue) {
      this.resetForm();
    }
  }

  submitTesterResponseForm() {
    if (this.testerResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.isSafeToSubmit().pipe(
      flatMap((isSaveToSubmit: boolean) => {
        if (isSaveToSubmit || this.isUpdatingDeletedResponse() ||
            this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return this.issueService.updateTesterResponse(this.issue, <IssueComment>{
            ...this.issue.issueComment,
            description: this.getTesterResponseFromForm(),
          });
        } else {
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isFormPending = false)
    ).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      this.resetToDefault();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  /**
   * @return - Determines whether it is safe to submit a tester response.
   */
  isSafeToSubmit(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        if (!issue.testerResponses) {
          return false;
        }
        return issue.testerResponses.reduce((result, response, index) => {
          return result && response.compareTo(this.issue.testerResponses[index]) === 0;
        }, true);
      })
    );
  }

  /**
   * Determines whether the user is updating a response that has already been deleted on Github.
   */
  isUpdatingDeletedResponse(): boolean {
    return this.issue.testerResponses && !this.issueService.issues[this.issue.id].testerResponses;
  }

  /**
   * Pops up a dialog that shows the difference between the outdated tester's response and the updated one.
   */
  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: <TesterResponseConflictData>{
        outdatedResponses: this.issue.testerResponses,
        updatedResponses: this.issueService.issues[this.issue.id].testerResponses,
      },
      autoFocus: false
    });
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
  }

  cancelEditMode() {
    this.issueService.getIssue(this.issue.id).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    });
  }

  /**
   * Resets to default form state.
   */
  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.updateEditState.emit(false);
    this.resetForm();
  }

  handleChangeOfDisagreeRadioButton(event, index: number) {
    const responseFormControl = this.testerResponseForm.get(this.getTesterResponseFormId(index));
    const isDisagreeChecked = this.isResponseDisagreed(index);
    if (isDisagreeChecked) {
      responseFormControl.enable();
    } else {
      responseFormControl.disable();
    }
  }

  trackDisagreeList(index: number, item: string[]): string {
    return item[index];
  }

  isNewResponse(): boolean {
    return !this.issue.status && this.userService.currentUser.role === UserRole.Student;
  }

  /**
   * Will create a form group with initial values in `this.issue`.
   */
  createFormGroup() {
    const group: any = {};
    // initialize fields for tester response and the radio buttons for tester to choose "Agree" / "Disagree"
    for (let i = 0; i < this.issue.testerResponses.length; i++) {
      const response = this.issue.testerResponses[i];
      group[this.getTesterResponseFormId(i)] = new FormControl({
        value: response.reasonForDisagreement,
        disabled: !response.isDisagree()
      }, Validators.required);
      group[this.getDisagreeRadioFormId(i)] = new FormControl({
        value: response.isDisagree(),
        disabled: !this.isEditing
      }, Validators.required);
    }
    return group;
  }

  resetForm(): void {
    this.testerResponseForm = this.formBuilder.group(this.createFormGroup());
  }

  /**
   * Based on the updated form and `this.issue` we obtain the updated tester response in Github format.
   */
  getTesterResponseFromForm(): string {
    if (!this.issue.testerResponses) {
      return '';
    }

    const updatedIssue = this.issue.clone(this.phaseService.currentPhase);

    updatedIssue.testerResponses.map((response: TesterResponse, index: number) => {
      // Filter Keys based on Response Index
      const isDisagree = this.isResponseDisagreed(index);
      const reason = isDisagree ? (this.getTesterResponseText(index) || response.reasonForDisagreement) : response.INITIAL_RESPONSE;

      response.setDisagree(isDisagree);
      response.setReasonForDisagreement(reason);
      return response;
    });

    return updatedIssue.createGithubTesterResponse();
  }

  /**
   * @param index - index of action which the tester disagree.
   */
  getTesterResponseFormId(index: number): string {
    return `${this.responseTextIdentifier}-${index}`;
  }

  /**
   * Gets the Tester's Response text.
   * @param index Tester Response Index.
   */
  getTesterResponseText(index: number): string {
    return this.testerResponseForm.get(this.getTesterResponseFormId(index)).value;
  }

  /**
   * @param index - index of action which the tester disagree.
   */
  getDisagreeRadioFormId(index: number): string {
    return `${this.responseRadioIdentifier}-${index}`;
  }

  /**
   * Checks if Tester Response was agreed to or disagreed with.
   * @param index Tester Response Index,
   * @returns true if response was disagreed with, false if response was agreed with.
   */
  isResponseDisagreed(index: number): boolean {
    return this.testerResponseForm.get(this.getDisagreeRadioFormId(index)).value;
  }

  get conflict(): boolean {
    return this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE;
  }
}
