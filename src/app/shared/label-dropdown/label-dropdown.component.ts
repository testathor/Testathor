import { Component, OnInit, Input } from '@angular/core';
import { LabelService } from '../../core/services/label.service';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Label } from '../../core/models/label.model';

export const WHITE_TEXT_CLASS = 'white-text';
export const BLACK_TEXT_CLASS = 'black-text';

@Component({
  selector: 'app-label-dropdown',
  templateUrl: './label-dropdown.component.html',
  styleUrls: ['./label-dropdown.component.css']
})
export class LabelDropdownComponent implements OnInit {
  dropdownControl: AbstractControl;
  @Input() attributeName: string;
  @Input() initialValue: string;
  @Input() dropdownForm: FormGroup;

  selectedColor: string;
  labelList: Label[];

  constructor(public labelService: LabelService) { }

  ngOnInit() {
    this.selectedColor = this.labelService.getColorOfLabel(this.initialValue);
    this.labelList = this.labelService.getLabelList(this.attributeName);
    this.dropdownControl = this.dropdownForm.get(this.attributeName);
  }

  setSelectedLabelColor(labelValue: string) {
    this.selectedColor = this.labelService.getColorOfLabel(labelValue);
  }

  setSelectedLabelTooltipMsg(label: Label) {
    return this.labelService.getLabelDefinition(label.labelValue, label.labelCategory);
  }

  get dropdownTextColor(): string {
    return this.labelService.isDarkColor(this.selectedColor) ? WHITE_TEXT_CLASS : BLACK_TEXT_CLASS;
  }
}
