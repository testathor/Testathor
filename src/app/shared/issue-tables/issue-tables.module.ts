import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { IssueTablesComponent } from './issue-tables.component';

@NgModule({
  exports: [
    IssueTablesComponent
  ],
  declarations: [
    IssueTablesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ]
})
export class IssueTablesModule { }
