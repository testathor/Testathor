import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-general-message-error',
  templateUrl: './general-message-error.component.html',
})
export class GeneralMessageErrorComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<GeneralMessageErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
