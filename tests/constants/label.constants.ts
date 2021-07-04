import { Label } from '../../src/app/core/models/label.model';
import { LabelService } from '../../src/app/core/services/label.service';

// Label name constants
export const SEVERITY_VERY_LOW = 'Very Low';
export const SEVERITY_LOW = 'Low';
export const SEVERITY_MEDIUM = 'Medium';
export const SEVERITY_HIGH = 'High';
export const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';
export const TYPE_FUNCTIONALITY_BUG = 'FunctionalityBug';
export const TYPE_FEATURE_FLAW = 'FeatureFlaw';
export const RESPONSE_ACCEPTED = 'Accepted';
export const RESPONSE_REJECTED = 'Rejected';
export const RESPONSE_ISSUE_UNCLEAR = 'IssueUnclear';
export const RESPONSE_CANNOT_REPRODUCE = 'CannotReproduce';
export const STATUS_DONE = 'Done';
export const STATUS_INCOMPLETE = 'Incomplete';

// Label category constants
export const SEVERITY = 'severity';
export const TYPE = 'type';
export const RESPONSE = 'response';
export const STATUS = 'status';

// Label definition
export const DEFINITION_EMPTY = '';
export const DEFINITION_SEVERITY_VERY_LOW =
  'A flaw that is purely cosmetic and does not affect usage e.g., ' +
  "a typo/spacing/layout/color/font issues in the docs or the UI that doesn't affect usage.";
export const DEFINITION_SEVERITY_LOW =
  'A flaw that is unlikely to affect normal operations of the product. ' +
  'Appears only in very rare situations and causes a minor inconvenience only.';
export const DEFINITION_SEVERITY_MEDIUM =
  'A flaw that causes occasional inconvenience to some users but they can ' + 'continue to use the product.';
export const DEFINITION_SEVERITY_HIGH =
  'A flaw that affects most users and causes major problems for users. ' + 'i.e., makes the product almost unusable for most users.';
export const DEFINITION_FUNCTIONALITY_BUG = 'A functionality does not work as specified/expected.';
export const DEFINITION_FEATURE_FLAW =
  'Some functionality missing from a feature delivered in the current version ' +
  'in a way that the feature becomes less useful to the intended target user for normal usage. i.e., ' +
  "the feature is not 'complete'. In other words, an acceptance-testing bug that falls within the scope of " +
  'the current version features. These issues are counted against the product design aspect of the project.';
export const DEFINITION_DOCUMENTATION_BUG = 'A flaw in the documentation e.g., a missing step, ' + 'a wrong instruction, typos';

// Label color constants
export const COLOR_BLACK = '000000';
export const COLOR_WHITE = 'FFFFFF';
export const COLOR_SEVERITY_VERY_LOW = 'ffe0e0';
export const COLOR_SEVERITY_LOW = 'ffcccc';
export const COLOR_SEVERITY_MEDIUM = 'ff9999';
export const COLOR_SEVERITY_HIGH = 'ff6666';
export const COLOR_TYPE_DOCUMENTATION_BUG = 'd966ff';
export const COLOR_TYPE_FUNCTIONALITY_BUG = '9900cc';
export const COLOR_RESPONSE_ACCEPTED = '00802b';
export const COLOR_RESPONSE_REJECTED = 'ff9900';
export const COLOR_RESPONSE_ISSUE_UNCLEAR = 'ffcc80';
export const COLOR_RESPONSE_CANNOT_REPRODUCE = 'ffebcc';
export const COLOR_STATUS_DONE = 'a6a6a6';
export const COLOR_STATUS_INCOMPLETE = '000000';

// CSS style constants
export const DARK_BG_LIGHT_TEXT = {
  'background-color': `#${COLOR_BLACK}`,
  'border-radius': '3px',
  cursor: 'default',
  padding: '3px',
  color: `#${COLOR_WHITE}`,
  'font-weight': '410'
};

export const LIGHT_BG_DARK_TEXT = {
  'background-color': `#${COLOR_WHITE}`,
  'border-radius': '3px',
  cursor: 'default',
  padding: '3px',
  color: `#${COLOR_BLACK}`,
  'font-weight': '410'
};

export const RESPONSE_REJECTED_LABEL = new Label(RESPONSE, RESPONSE_REJECTED, COLOR_RESPONSE_REJECTED);
export const STATUS_DONE_LABEL = new Label(STATUS, STATUS_DONE, COLOR_STATUS_DONE);
export const TYPE_DOCUMENTATION_BUG_LABEL = new Label(
  TYPE,
  TYPE_DOCUMENTATION_BUG,
  COLOR_TYPE_DOCUMENTATION_BUG,
  DEFINITION_DOCUMENTATION_BUG
);

export const SEVERITY_HIGH_LABEL = new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, DEFINITION_SEVERITY_HIGH);
export const SEVERITY_MEDIUM_LABEL = new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, DEFINITION_SEVERITY_MEDIUM);
export const SEVERITY_LOW_LABEL = new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, DEFINITION_SEVERITY_LOW);

// Constant array of labels to simulate Github response
export const LABEL_ARRAY = [
  {
    color: COLOR_RESPONSE_ACCEPTED,
    name: RESPONSE + '.' + RESPONSE_ACCEPTED
  },
  {
    color: COLOR_SEVERITY_LOW,
    name: SEVERITY + '.' + SEVERITY_LOW,
    definition: DEFINITION_SEVERITY_LOW
  },
  {
    color: COLOR_TYPE_FUNCTIONALITY_BUG,
    name: TYPE + '.' + TYPE_FUNCTIONALITY_BUG,
    definition: DEFINITION_FUNCTIONALITY_BUG
  }
];

export const ALL_REQUIRED_LABELS_ARRAY: {}[] = LabelService.getRequiredLabelsAsArray().map((label: Label) => {
  return {
    color: label.labelColor,
    name: label.getFormattedName()
  };
});

// List of labels
export const SEVERITY_LABELS = [
  new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, DEFINITION_SEVERITY_LOW),
  new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, DEFINITION_SEVERITY_MEDIUM),
  new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, DEFINITION_SEVERITY_HIGH)
];
