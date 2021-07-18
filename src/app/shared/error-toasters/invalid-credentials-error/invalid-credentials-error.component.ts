import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-form-error',
  templateUrl: './invalid-credentials-error.component.html',
})
export class InvalidCredentialsErrorComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<InvalidCredentialsErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
