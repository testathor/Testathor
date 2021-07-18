import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import {
  FILE_TYPE_SUPPORT_ERROR,
  getSizeExceedErrorMsg,
  SUPPORTED_FILE_TYPES,
  UploadService } from '../../core/services/upload.service';

const DISPLAYABLE_CONTENT = ['gif', 'jpeg', 'jpg', 'png'];
const BYTES_PER_MB = 1000000;
const MAX_UPLOAD_SIZE = 10 * BYTES_PER_MB; // 10MB
const MAX_VIDEO_UPLOAD_SIZE = 5 * BYTES_PER_MB; // 5MB

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.css'],
})
export class CommentEditorComponent implements OnInit {
  readonly SUPPORTED_FILE_TYPES = SUPPORTED_FILE_TYPES;

  constructor(private uploadService: UploadService,
              private errorHandlingService: ErrorHandlingService) {}

  @Input() commentField: AbstractControl; // Compulsory Input
  @Input() commentForm: FormGroup; // Compulsory Input
  @Input() id: string; // Compulsory Input

  @Input() initialDescription?: string;
  placeholderText = 'No details provided.';

  // Allows the comment editor to control the overall form's completeness.
  @Input() isFormPending?: boolean;
  @Output() isFormPendingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Allow the comment editor to control the text of the submit button to prompt the user.
  @Input() submitButtonText?: string;
  @Output() submitButtonTextChange: EventEmitter<string> = new EventEmitter<string>();
  formatFileUploadingButtonText: (string) => string = ((currentButtonText: string) => {
    return currentButtonText + ' (Waiting for File Upload to finish...)';
  });
  initialSubmitButtonText: string;
  lastUploadingTime: string;

  @ViewChild('dropArea') dropArea;
  @ViewChild('commentTextArea') commentTextArea;
  @ViewChild('markdownArea') markdownArea;

  dragActiveCounter = 0;
  uploadErrorMessage: string;

  ngOnInit() {
    if (this.initialDescription !== undefined) {
      this.commentField.setValue(this.initialDescription);
    }

    if (this.commentField === undefined || this.commentForm === undefined || this.id === undefined) {
      throw new Error('Comment Editor\'s compulsory properties are not defined.');
    }

    this.initialSubmitButtonText = this.submitButtonText;
  }

  onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    this.dragActiveCounter++;
    if (this.commentField.disabled) {
      this.dropArea.nativeElement.classList.add('highlight-drag-box-disabled');
    } else {
      this.dropArea.nativeElement.classList.add('highlight-drag-box');
    }
  }

  // Prevent cursor in textarea from moving when file is dragged over it.
  disableCaretMovement(event) {
    event.preventDefault();
  }

  // To enable file drop in non-input elements, the dragOver event must be cancelled.
  enableFileDrop(event) {
    event.preventDefault();
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.removeHighlightBorderStyle();

    if (this.commentField.disabled) {
      return;
    }

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.readAndUploadFile(files[0]);
      this.commentTextArea.nativeElement.focus();
    }
  }

  onDragExit(event) {
    event.preventDefault();
    event.stopPropagation();

    this.removeHighlightBorderStyle();
  }

  onFileInputUpload(event, fileInput) {
    event.preventDefault();
    event.stopPropagation();

    const files = fileInput.files;
    if (files.length > 0) {
      this.readAndUploadFile(files[0]);
      fileInput.value = '';
    }
  }

  updateParentFormsSubmittability(isFormPending: boolean, submitButtonText: string) {
      this.isFormPendingChange.emit(isFormPending);
      this.submitButtonTextChange.emit(submitButtonText);
  }

  readAndUploadFile(file: File): void {
    this.uploadErrorMessage = null;
    const reader = new FileReader();
    const filename = file.name;
    const insertedText = this.insertUploadingText(filename);

    if (file.size >= MAX_UPLOAD_SIZE) {
      const uploadSizeLimitMb = MAX_UPLOAD_SIZE / BYTES_PER_MB;
      this.handleUploadError(getSizeExceedErrorMsg('file', uploadSizeLimitMb), insertedText);
      return;
    }

    if (this.uploadService.isVideoFile(filename) && file.size >= MAX_VIDEO_UPLOAD_SIZE) {
      const videoUploadSizeLimitMb = MAX_VIDEO_UPLOAD_SIZE / BYTES_PER_MB;
      this.handleUploadError(getSizeExceedErrorMsg('video', videoUploadSizeLimitMb), insertedText);
      return;
    }

    if (!this.uploadService.isSupportedFileType(filename)) {
      this.handleUploadError(FILE_TYPE_SUPPORT_ERROR, insertedText);
      return;
    }

    // Log the most recent upload.
    this.lastUploadingTime = new Date().getTime().toString();
    const currentFileUploadTime = this.lastUploadingTime;

    // Prevents Form Submission during Upload
    this.updateParentFormsSubmittability(true, this.formatFileUploadingButtonText(this.initialSubmitButtonText));

    reader.onload = () => {
      this.uploadService.uploadFile(reader.result, filename).subscribe((response) => {
        this.insertUploadUrl(filename, response.data.content.download_url);
      }, (error) => {
        this.handleUploadError(error, insertedText);
        // Allow button enabling if this is the last file that was uploaded.
        if (currentFileUploadTime === this.lastUploadingTime) {
          this.updateParentFormsSubmittability(false, this.initialSubmitButtonText);
        }
      }, () => {
        // Allow button enabling if this is the last file that was uploaded.
        if (currentFileUploadTime === this.lastUploadingTime) {
          this.updateParentFormsSubmittability(false, this.initialSubmitButtonText);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  onPaste(event) {
    const items = event.clipboardData.items;
    let blob = null;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        break;
      }
    }
    if (blob) {
      this.readAndUploadFile(blob);
    }
  }

  get isInErrorState(): boolean {
    return !!this.uploadErrorMessage;
  }

  private handleUploadError(error, insertedText: string) {
    if (error instanceof HttpErrorResponse) {
      this.errorHandlingService.handleError(error);
      this.uploadErrorMessage = 'Something went wrong while uploading your file. Please try again.';
    } else {
      this.uploadErrorMessage = error;
    }
    this.commentField.setValue(this.commentField.value.replace(insertedText, ''));
  }

  private insertUploadingText(filename: string): string {
    const originalDescription = this.commentField.value;

    const fileType = filename.split('.').pop();
    let toInsert: string;
    if (DISPLAYABLE_CONTENT.includes(fileType.toLowerCase())) {
      toInsert = `![Uploading ${filename}...]\n`;
    } else {
      toInsert = `[Uploading ${filename}...]\n`;
    }

    const cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
    const endOfLineIndex = originalDescription.indexOf('\n', cursorPosition);
    const nextCursorPosition = cursorPosition + toInsert.length;

    if (endOfLineIndex === -1) {
      if (this.commentField.value === '') {
        this.commentField.setValue(toInsert);
      } else {
        this.commentField.setValue(`${this.commentField.value}\n${toInsert}`);
      }
    } else {
      const startTillNewline = originalDescription.slice(0, endOfLineIndex + 1);
      const newlineTillEnd = originalDescription.slice(endOfLineIndex);
      this.commentField.setValue(`${startTillNewline + toInsert + newlineTillEnd}`);
    }

    this.commentTextArea.nativeElement.setSelectionRange(nextCursorPosition, nextCursorPosition);
    return toInsert;
  }

  private insertUploadUrl(filename: string, uploadUrl: string) {
    const cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
    const startIndexOfString = this.commentField.value.indexOf(`[Uploading ${filename}...]`);
    const endIndexOfString = startIndexOfString + `[Uploading ${filename}...]`.length;
    const endOfInsertedString = startIndexOfString + `[${filename}](${uploadUrl})`.length;

    this.commentField.setValue(
      this.commentField.value.replace(`[Uploading ${filename}...]`, `[${filename}](${uploadUrl})`));

    if (cursorPosition > startIndexOfString - 1 && cursorPosition <= endIndexOfString) { // within the range of uploading text
      this.commentTextArea.nativeElement.setSelectionRange(endOfInsertedString, endOfInsertedString);
    } else {
      this.commentTextArea.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  private removeHighlightBorderStyle() {
    this.dragActiveCounter--;
    if (this.dragActiveCounter === 0) { // To make sure when dragging over a child element, drop area is still highlight.
      this.dropArea.nativeElement.classList.remove('highlight-drag-box');
      this.dropArea.nativeElement.classList.remove('highlight-drag-box-disabled');
    }
  }
}
