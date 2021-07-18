import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-unsure-checkbox',
  templateUrl: './unsure-checkbox.component.html',
  styleUrls: ['./unsure-checkbox.component.css']
})
export class UnsureCheckboxComponent implements OnInit {

  @Input() issue: Issue;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              private phaseService: PhaseService) { }

  ngOnInit() {
  }

  handleChangeOfUnsureCheckbox(event) {
    let UNSURE = false;

    if (event.checked) {
      UNSURE = true;
    }

    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.unsure = UNSURE;
    this.issueService.updateIssue(newIssue).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

}
