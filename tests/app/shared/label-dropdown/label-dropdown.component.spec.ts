import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabelService } from '../../../../src/app/core/services/label.service';
import {
  BLACK_TEXT_CLASS,
  LabelDropdownComponent,
  WHITE_TEXT_CLASS
} from '../../../../src/app/shared/label-dropdown/label-dropdown.component';
import { COLOR_WHITE, SEVERITY, SEVERITY_LABELS } from '../../../constants/label.constants';

describe('LabelDropdownComponent', () => {
  let labelDropdownComponent: LabelDropdownComponent;
  let labelService: any;

  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList', 'getColorOfLabel', 'isDarkColor']);

    const formGroup: FormGroup = new FormBuilder().group({
      title: ['', Validators.required],
      description: ['No details provided.'],
      severity: ['', Validators.required],
      type: ['', Validators.required]
    });

    labelDropdownComponent = new LabelDropdownComponent(labelService);
    labelDropdownComponent.dropdownForm = formGroup;
  });

  it('should be initialised with a list of labels, an initial colour and a dropdown control', () => {
    labelDropdownComponent.attributeName = SEVERITY;
    labelDropdownComponent.initialValue = '';
    labelService.getLabelList.and.returnValue(SEVERITY_LABELS);
    labelService.getColorOfLabel.and.returnValue(COLOR_WHITE);

    labelDropdownComponent.ngOnInit();
    expect(labelDropdownComponent.labelList).toEqual(SEVERITY_LABELS);
    expect(labelDropdownComponent.selectedColor).toEqual(COLOR_WHITE);
    expect(labelDropdownComponent.dropdownControl).toBeDefined();
  });

  it('should set its dropdown text colour based on the darkness of the current colour', () => {
    labelService.isDarkColor.and.returnValue(false);
    expect(labelDropdownComponent.dropdownTextColor).toBe(BLACK_TEXT_CLASS);
    labelService.isDarkColor.and.returnValue(true);
    expect(labelDropdownComponent.dropdownTextColor).toBe(WHITE_TEXT_CLASS);
  });
});
