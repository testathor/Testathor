import { LabelService } from '../../src/app/core/services/label.service';
import { Label } from '../../src/app/core/models/label.model';
import * as LabelConstant from '../constants/label.constants';
import { of } from 'rxjs';

let labelService: LabelService;
let labelList: Label[];
let githubService: any;

describe('LabelService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['fetchAllLabels', 'createLabel']);
    labelService = new LabelService(githubService);
  });

  describe('.syncLabels()', () => {
    it('should create all required labels if no required labels are fetched', () => {
      githubService.fetchAllLabels.and.callFake(() => of([]));
      of(true).pipe(labelService.syncLabels()).subscribe();

      assertLabelCreated(githubService, LabelConstant.SEVERITY_LOW_LABEL);
      assertLabelCreated(githubService, LabelConstant.RESPONSE_REJECTED_LABEL);
      assertLabelCreated(githubService, LabelConstant.STATUS_DONE_LABEL);
      assertLabelCreated(githubService, LabelConstant.TYPE_DOCUMENTATION_BUG_LABEL);
      expect(githubService.createLabel).toHaveBeenCalledTimes(LabelService.getRequiredLabelsAsArray().length);
    });

    it('should create missing required labels if some required labels are fetched', () => {
      githubService.fetchAllLabels.and.callFake(() => of(LabelConstant.LABEL_ARRAY));
      of(true).pipe(labelService.syncLabels()).subscribe();

      assertLabelNotCreated(githubService, LabelConstant.SEVERITY_LOW_LABEL);
      assertLabelCreated(githubService, LabelConstant.RESPONSE_REJECTED_LABEL);
      assertLabelCreated(githubService, LabelConstant.STATUS_DONE_LABEL);
      assertLabelCreated(githubService, LabelConstant.TYPE_DOCUMENTATION_BUG_LABEL);
      expect(githubService.createLabel).toHaveBeenCalledTimes(
        LabelService.getRequiredLabelsAsArray().length - LabelConstant.LABEL_ARRAY.length
      );
    });

    it('should not need to create any required labels if all required labels are fetched', () => {
      githubService.fetchAllLabels.and.callFake(() => of(LabelConstant.ALL_REQUIRED_LABELS_ARRAY));
      of(true).pipe(labelService.syncLabels()).subscribe();

      expect(githubService.createLabel).toHaveBeenCalledTimes(0);
    });
  });
});

describe('LabelService: parseLabelData()', () => {
  beforeAll(() => {
    labelService = new LabelService(null);
    labelList = labelService.parseLabelData(LabelConstant.LABEL_ARRAY);
  });

  afterAll(() => {
    labelService = null;
  });

  it('should be response.Accepted label', () => {
    expect(labelList[0].labelCategory).toBe(LabelConstant.RESPONSE);
    expect(labelList[0].labelValue).toBe(LabelConstant.RESPONSE_ACCEPTED);
    expect(labelList[0].labelColor).toBe(LabelConstant.COLOR_RESPONSE_ACCEPTED);
  });

  it('should be severity.Low', () => {
    expect(labelList[1].labelCategory).toBe(LabelConstant.SEVERITY);
    expect(labelList[1].labelValue).toBe(LabelConstant.SEVERITY_LOW);
    expect(labelList[1].labelColor).toBe(LabelConstant.COLOR_SEVERITY_LOW);
    expect(labelList[1].labelDefinition).toBe(LabelConstant.DEFINITION_SEVERITY_LOW);
  });

  it('should be type.FunctionalityBug', () => {
    expect(labelList[2].labelCategory).toBe(LabelConstant.TYPE);
    expect(labelList[2].labelValue).toBe(LabelConstant.TYPE_FUNCTIONALITY_BUG);
    expect(labelList[2].labelColor).toBe(LabelConstant.COLOR_TYPE_FUNCTIONALITY_BUG);
    expect(labelList[2].labelDefinition).toBe(LabelConstant.DEFINITION_FUNCTIONALITY_BUG);
  });
});

describe('LabelService: isDarkColor()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be true for dark color', () => {
    expect(labelService.isDarkColor(LabelConstant.COLOR_BLACK)).toBeTruthy();
  });

  it('should be false for light color', () => {
    expect(labelService.isDarkColor(LabelConstant.COLOR_WHITE)).toBeFalsy();
  });
});

describe('LabelService: setLabelStyle()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be dark color background with light color text', () => {
    expect(labelService.setLabelStyle(LabelConstant.COLOR_BLACK)).toEqual(LabelConstant.DARK_BG_LIGHT_TEXT);
  });

  it('should be light color background with dark color text', () => {
    expect(labelService.setLabelStyle(LabelConstant.COLOR_WHITE)).toEqual(LabelConstant.LIGHT_BG_DARK_TEXT);
  });
});

describe('LabelService: getColorOfLabel()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be correct label color for Severity.Low', () => {
    expect(labelService.getColorOfLabel(LabelConstant.SEVERITY_LOW)).toEqual(LabelConstant.COLOR_SEVERITY_LOW);
  });

  it('should be white color for invalid inputs', () => {
    expect(labelService.getColorOfLabel(null)).toEqual(LabelConstant.COLOR_WHITE.toLowerCase());
  });
});

describe('LabelService: getLabelDefinition()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be correct label definition for type.FunctionalityBug', () => {
    expect(labelService.getLabelDefinition(LabelConstant.TYPE_FUNCTIONALITY_BUG, LabelConstant.TYPE)).toEqual(
      LabelConstant.DEFINITION_FUNCTIONALITY_BUG
    );
  });

  it('should be correct label definition for severity.Medium', () => {
    expect(labelService.getLabelDefinition(LabelConstant.SEVERITY_MEDIUM, LabelConstant.SEVERITY)).toEqual(
      LabelConstant.DEFINITION_SEVERITY_MEDIUM
    );
  });

  it('should be an empty string for label with no definition', () => {
    expect(labelService.getLabelDefinition(LabelConstant.STATUS_DONE, LabelConstant.STATUS)).toEqual(LabelConstant.DEFINITION_EMPTY);
  });

  it('should be an empty string for invalid inputs', () => {
    expect(labelService.getLabelDefinition(null, null)).toEqual(LabelConstant.DEFINITION_EMPTY);
    expect(labelService.getLabelDefinition(null, LabelConstant.SEVERITY)).toEqual(LabelConstant.DEFINITION_EMPTY);
    expect(labelService.getLabelDefinition(LabelConstant.SEVERITY_MEDIUM, null)).toEqual(LabelConstant.DEFINITION_EMPTY);
  });
});

function assertLabelCreated(githubService: any, label: Label) {
  expect(githubService.createLabel).toHaveBeenCalledWith(label.getFormattedName(), label.labelColor);
}

function assertLabelNotCreated(githubService: any, label: Label) {
  expect(githubService.createLabel).not.toHaveBeenCalledWith(label.getFormattedName(), label.labelColor);
}
