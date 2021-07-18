import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { LabelDropdownComponent } from './label-dropdown.component';

@NgModule({
  declarations: [
    LabelDropdownComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    LabelDropdownComponent
  ]
})
export class LabelDropdownModule { }
