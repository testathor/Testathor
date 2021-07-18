import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
})
export class FormErrorComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<FormErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
