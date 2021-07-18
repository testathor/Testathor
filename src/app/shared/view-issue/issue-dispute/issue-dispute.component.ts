import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { finalize, flatMap, map } from 'rxjs/operators';
import { IssueComment } from '../../../core/models/comment.model';
import { Issue } from '../../../core/models/issue.model';
import { ElectronService } from '../../../core/services/electron.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { GithubService } from '../../../core/services/github.service';
import { IssueService } from '../../../core/services/issue.service';
import { PhaseService } from '../../../core/services/phase.service';
import { UserService } from '../../../core/services/user.service';
import { CommentEditorComponent } from '../../comment-editor/comment-editor.component';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';

@Component({
  selector: 'app-issue-dispute',
  templateUrl: './issue-dispute.component.html',
  styleUrls: ['./issue-dispute.component.css']
})
export class IssueDisputeComponent implements OnInit, OnChanges {
  tutorResponseForm: FormGroup;
  isFormPending = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService,
              private githubService: GithubService,
              private phaseService: PhaseService,
              private electronService: ElectronService) { }

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


  submitTutorResponseForm(form: NgForm) {
    if (this.tutorResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.issue.pending = '' + this.getNumOfPending();

    this.isSafeToSubmitTutorResponse().pipe(
      flatMap((isSave: boolean) => {
        if (isSave || this.isUpdatingDeletedResponse()) {
          if (this.issue.issueComment && !this.isUpdatingDeletedResponse()) {
            return this.updateTutorResponse();
          } else {
            return this.createTutorResponse();
          }
        } else {
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isFormPending = false)
    ).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  updateTutorResponse(): Observable<Issue> {
    return this.issueService.updateTutorResponse(this.issue, <IssueComment>{
      ...this.issue.issueComment,
      description: this.getTutorResponseFromForm()
    });
  }

  createTutorResponse(): Observable<Issue> {
    const tutorResponse = this.getTutorResponseFromForm();
    return this.issueService.createTutorResponse(this.issue, tutorResponse);
  }

  /**
   * @return - Determines whether it is safe to submit an issue dispute's resolution.
   */
  isSafeToSubmitTutorResponse(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        if (issue.issueComment && !!issue.issueComment === !!this.issue.issueComment) {
          for (let i = 0; i < issue.issueDisputes.length; i++) {
            if (issue.issueDisputes[i].compareTo(this.issue.issueDisputes[i]) !== 0) {
              return false;
            }
          }
          return true;
        } else {
          return !!issue.issueComment === !!this.issue.issueComment;
        }
      })
    );
  }

  /**
   * Determines whether the user is updating a response that has already been deleted on Github.
   */
  isUpdatingDeletedResponse(): boolean {
    return this.issue.issueComment && !this.issueService.issues[this.issue.id].issueComment;
  }

  /**
   * Resets to default form state.
   */
  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.updateEditState.emit(false);
    this.resetForm();
  }

  viewInGithub(): void {
    this.electronService.openLink(`https://github.com/${this.githubService.getRepoURL()}/issues/` +
      `${this.issue.id}#issuecomment-${this.issue.issueComment.id}`);
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

  trackDisputeList(index: number, item: string[]): string {
    return item[index];
  }

  isNewResponse(): boolean {
    return !this.issue.issueComment;
  }

  /**
   * Will reset the form to the initial values of `this.issue`.
   */
  resetForm(): void {
    this.tutorResponseForm = this.formBuilder.group(this.createFormGroup());
  }

  getItemTitleText(title: string): string {
    return '## ' + title;
  }

  getNumOfPending(): number {
    let pending = this.issue.issueDisputes.length; // Initial pending is number of disputes
    for (const issueDispute of this.issue.issueDisputes) {
      // For each number of Done that is checked, reduce pending by one
      if (issueDispute.isDone()) {
        pending--;
      }
    }
    return pending;
  }

  /**
   * Will create a form group with initial values in `this.issue`.
   */
  createFormGroup() {
    const group: any = {};
    // initialize fields for tutor response and the checkboxes for tutor to mark "Done"
    for (let i = 0; i < this.issue.issueDisputes.length; i++) {
      const dispute = this.issue.issueDisputes[i];
      group[this.getTutorResponseFormId(i)] = new FormControl(dispute.tutorResponse, Validators.required);
      group[this.getTodoFormId(i)] = new FormControl({value: dispute.isDone(), disabled: !this.isEditing}, Validators.required);
    }
    return group;
  }

  /**
   * Obtain the updated Github comment format for the tutor response based on the values in the form and `this.issue`.
   */
  getTutorResponseFromForm(): string {
    if (!this.issue.issueDisputes) {
      return '';
    }

    const values = this.tutorResponseForm.getRawValue();
    const todos = [];
    const responses = [];
    const updatedIssue = this.issue.clone(this.phaseService.currentPhase);

    let index = 0;
    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith('todo')) {
        todos.push(value);
      } else if (key.startsWith('tutor-response')) {
        responses.push(value);
      }
      index++;
    }

    index = 0;
    for (const dispute of updatedIssue.issueDisputes) {
      const isDone = todos[index] === undefined ? dispute.isDone() : todos[index];
      const tutorResponse = responses[index] || dispute.tutorResponse;
      updatedIssue.issueDisputes[index].setTutorResponse(tutorResponse);
      updatedIssue.issueDisputes[index].setIsDone(isDone);
      index++;
    }
    return updatedIssue.createGithubTutorResponse();
  }

  /**
   * @param index - index of dispute which the tutor resolve.
   */
  getTutorResponseFormId(index: number): string {
    return `tutor-response-${index}`;
  }

  /**
   * @param index - index of dispute which the tutor resolve.
   */
  getTodoFormId(index: number): string {
    return `todo-${index}`;
  }

  get conflict(): boolean {
    return this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE;
  }
}
