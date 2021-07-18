import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Conflict } from '../../../../core/models/conflict/conflict.model';
import { TesterResponse } from '../../../../core/models/tester-response.model';
import { IssueService } from '../../../../core/services/issue.service';
import { LabelService } from '../../../../core/services/label.service';


export interface TesterResponseConflictData {
  outdatedResponses: TesterResponse[];
  updatedResponses: TesterResponse[];
}

@Component({
  selector: 'app-conflict-dialog',
  templateUrl: 'conflict-dialog.component.html',
  styleUrls: ['./conflict-dialog.component.css']
})
export class ConflictDialogComponent {
  isReady = false;
  showDiff = true;

  conflicts: Conflict[] = [];
  diffHtmls: SafeHtml[] = [];
  updatedHtmls: SafeHtml[] = [];
  panelOpenStates: boolean[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TesterResponseConflictData,
    private sanitizer: DomSanitizer,
    public labelService: LabelService,
    public issueService: IssueService) {

    for (let i = 0; i < data.updatedResponses.length; i++) {
      this.conflicts.push(new Conflict(data.outdatedResponses[i].getDisagreementWithoutDefaultResponse(),
        data.updatedResponses[i].getDisagreementWithoutDefaultResponse()));
      this.diffHtmls.push(this.sanitizer.bypassSecurityTrustHtml(this.conflicts[i].getHtmlDiffString()));
      this.updatedHtmls.push(this.sanitizer.bypassSecurityTrustHtml(this.conflicts[i].getHtmlUpdatedString()));
      this.panelOpenStates.push(data.outdatedResponses[i].compareTo(data.updatedResponses[i]) !== 0);
    }

    this.isReady = true;
  }

  close(): void {
    this.dialogRef.close();
  }

  handleChangeShowDiff() {
    this.showDiff = !this.showDiff;
  }
}
