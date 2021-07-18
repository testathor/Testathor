import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Issue } from '../../core/models/issue.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueService } from '../../core/services/issue.service';
import { LabelService } from '../../core/services/label.service';
import { SUBMIT_BUTTON_TEXT } from '../../shared/view-issue/view-issue.component';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {
  newIssueForm: FormGroup;
  isFormPending = false;

  submitButtonText: string;

  constructor(private issueService: IssueService, private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService, public labelService: LabelService,
              private router: Router) { }

  ngOnInit() {
    this.newIssueForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      severity: ['', Validators.required],
      type: ['', Validators.required],
    });

    this.submitButtonText = SUBMIT_BUTTON_TEXT.SUBMIT;
  }

  submitNewIssue(form: NgForm) {
    if (this.newIssueForm.invalid) {
      return;
    }
    this.isFormPending = true;
    this.issueService.createIssue(this.title.value,
      Issue.updateDescription(this.description.value),
      this.severity.value, this.type.value).pipe(finalize(() => this.isFormPending = false))
      .subscribe(
        newIssue => {
          this.issueService.updateLocalStore(newIssue);
          this.router.navigateByUrl(`phaseBugReporting/issues/${newIssue.id}`);
          form.resetForm();
          },
          error => {
          this.errorHandlingService.handleError(error);
        });
  }

  get title() {
    return this.newIssueForm.get('title');
  }

  get description() {
    return this.newIssueForm.get('description');
  }

  get severity() {
    return this.newIssueForm.get('severity');
  }

  get type() {
    return this.newIssueForm.get('type');
  }
}
