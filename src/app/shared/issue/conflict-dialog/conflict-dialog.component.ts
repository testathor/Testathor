import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { IssueService } from '../../../core/services/issue.service';
import { LabelService } from '../../../core/services/label.service';

/**
 * A Component that is in a form of a dialog modal and its purpose is to
 * display the difference between 2 pieces of text.
 */
@Component({
  selector: 'app-conflict-dialog',
  templateUrl: 'conflict-dialog.component.html',
  styleUrls: ['./conflict-dialog.component.css']
})
export class ConflictDialogComponent {
  isOnPreview = false;
  isReady = false;
  showDiff = true;

  diffHtml: SafeHtml;
  updatedHtml: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<ConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Conflict,
    private sanitizer: DomSanitizer,
    public labelService: LabelService,
    public issueService: IssueService) {

    this.diffHtml = this.sanitizer.bypassSecurityTrustHtml(data.getHtmlDiffString());
    this.updatedHtml = this.sanitizer.bypassSecurityTrustHtml(data.getHtmlUpdatedString());
    this.isReady = true;
  }

  close(): void {
    this.dialogRef.close();
  }

  handleChangeShowDiff() {
    this.showDiff = !this.showDiff;
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.isOnPreview = (event.index === 1);
  }
}
