import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[disableControl]'
})
export class FormDisableControlDirective {

  @Input() set disableControl(condition: boolean) {
    condition ? this.ngControl.control.disable() : this.ngControl.control.enable();
  }

  constructor( private ngControl: NgControl ) {
  }

}
