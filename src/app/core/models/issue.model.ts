import * as moment from 'moment';
import { Phase } from '../models/phase.model';
import { IssueComment } from './comment.model';
import { GithubComment } from './github/github-comment.model';
import { GithubIssue } from './github/github-issue.model';
import { GithubLabel } from './github/github-label.model';
import { HiddenData } from './hidden-data.model';
import { IssueDispute } from './issue-dispute.model';
import { Team } from './team.model';
import { TeamResponseTemplate } from './templates/team-response-template.model';
import { TesterResponseTemplate } from './templates/tester-response-template.model';
import { TutorModerationIssueTemplate } from './templates/tutor-moderation-issue-template.model';
import { TutorModerationTodoTemplate } from './templates/tutor-moderation-todo-template.model';
import { TesterResponse } from './tester-response.model';

export class Issue {

  /** Basic Fields */
  readonly globalId: string;
  readonly id: number;
  readonly created_at: string;
  readonly githubIssue: GithubIssue;
  githubComments: GithubComment[];
  title: string;
  description: string;
  hiddenDataInDescription: HiddenData;

  /** Fields derived from Labels */
  severity: string;
  type: string;
  responseTag?: string;
  duplicated?: boolean;
  status?: string;
  pending?: string;
  unsure?: boolean;
  teamAssigned?: Team;

  /** Depending on the phase, assignees attribute can be derived from Github's assignee feature OR from the Github's issue description */
  assignees?: string[];

  /** Fields derived from parsing of Github's issue description */
  duplicateOf?: number;
  teamResponse?: string;
  testerResponses?: TesterResponse[];
  issueComment?: IssueComment; // Issue comment is used for Tutor Response and Tester Response
  issueDisputes?: IssueDispute[];

  /**
   * Formats the text to create space at the end of the user input to prevent any issues with
   * the markdown interpretation.
   *
   * Brought over from comment-editor.component.ts
   */
  static formatText(text: string): string {
    if (text === null) {
      return null;
    }

    if (text === undefined) {
      return undefined;
    }

    const newLinesRegex = /[\n\r]/gi;
    const textSplitArray = text.split(newLinesRegex);
    if (textSplitArray.filter(split => split.trim() !== '').length > 0) {
      return `${text}\n\n`;
    } else {
      return text;
    }
  }

  /**
   * Processes and cleans a raw issue description obtained from user input.
   */
  static updateDescription(description: string): string {
    const defaultString = 'No details provided by bug reporter.';
    return Issue.orDefaultString(Issue.formatText(description), defaultString);
  }

  /**
   * Processes and cleans a raw team response obtained from user input.
   */
  static updateTeamResponse(teamResponse: string): string {
    const defaultString = 'No details provided by team.';
    return Issue.orDefaultString(Issue.formatText(teamResponse), defaultString);
  }

  /**
   * Given two strings, returns the first if it is not an empty string or a false value such as null/undefined.
   * Returns the second string if the first is an empty string.
   */
  private static orDefaultString(stringA: string, def: string): string {
    if (!stringA) {
      return def;
    }
    return stringA.length !== 0 ? stringA : def;
  }

  protected constructor(githubIssue: GithubIssue) {
    /** Basic Fields */
    this.globalId = githubIssue.id;
    this.id = +githubIssue.number;
    this.created_at = moment(githubIssue.created_at).format('lll');
    this.title = githubIssue.title;
    this.hiddenDataInDescription = new HiddenData(githubIssue.body);
    this.description = Issue.updateDescription(this.hiddenDataInDescription.originalStringWithoutHiddenData);
    this.githubIssue = githubIssue;

    /** Fields derived from Labels */
    this.severity = githubIssue.findLabel(GithubLabel.LABELS.severity);
    this.type = githubIssue.findLabel(GithubLabel.LABELS.type);
    this.responseTag = githubIssue.findLabel(GithubLabel.LABELS.response);
    this.duplicated = !!githubIssue.findLabel(GithubLabel.LABELS.duplicated, false);
    this.status = githubIssue.findLabel(GithubLabel.LABELS.status);
    this.pending = githubIssue.findLabel(GithubLabel.LABELS.pending);
  }

  public static createPhaseBugReportingIssue(githubIssue: GithubIssue): Issue {
    return new Issue(githubIssue);
  }

  public static createPhaseTeamResponseIssue(githubIssue: GithubIssue, teamData: Team): Issue {
    const issue = new Issue(githubIssue);
    const template = new TeamResponseTemplate(githubIssue.comments);

    issue.githubComments = githubIssue.comments;
    issue.teamAssigned = teamData;
    issue.issueComment = template.comment;
    issue.teamResponse = template.teamResponse && Issue.updateTeamResponse(template.teamResponse.content);
    issue.duplicateOf = template.duplicateOf && template.duplicateOf.issueNumber;
    issue.duplicated = issue.duplicateOf !== undefined && issue.duplicateOf !== null;
    issue.assignees = githubIssue.assignees.map(assignee => assignee.login);
    return issue;
  }

  public static createPhaseTesterResponseIssue(githubIssue: GithubIssue): Issue {
    const issue = new Issue(githubIssue);
    const template = new TesterResponseTemplate(githubIssue.comments);

    issue.githubComments = githubIssue.comments;
    issue.issueComment = template.comment;
    issue.teamResponse = template.teamResponse && Issue.updateTeamResponse(template.teamResponse.content);
    issue.testerResponses = template.testerResponse && template.testerResponse.testerResponses;
    return issue;
  }

  public static createPhaseModerationIssue(githubIssue: GithubIssue, teamData: Team): Issue {
    const issue = new Issue(githubIssue);
    const issueTemplate = new TutorModerationIssueTemplate(githubIssue);
    const todoTemplate = new TutorModerationTodoTemplate(githubIssue.comments);

    issue.githubComments = githubIssue.comments;
    issue.teamAssigned = teamData;
    issue.description = issueTemplate.description.content;
    issue.teamResponse = issueTemplate.teamResponse && Issue.updateTeamResponse(issueTemplate.teamResponse.content);
    issue.issueDisputes = issueTemplate.dispute.disputes;

    if (todoTemplate.moderation && todoTemplate.comment) {
      issue.issueDisputes = todoTemplate.moderation.disputesToResolve.map((dispute, i) => {
        dispute.description = issueTemplate.dispute.disputes[i].description;
        return dispute;
      });
      issue.issueComment = todoTemplate.comment;
    }
    return issue;
  }

  /**
   * Creates a new copy of an exact same issue.
   * This would come useful in the event when you want to update the issue but not the actual
   * state of the application.
   */
  clone(phase: Phase): Issue {
    switch (phase) {
      case Phase.phaseBugReporting:
        return Issue.createPhaseBugReportingIssue(this.githubIssue);
      case Phase.phaseTeamResponse:
        return Issue.createPhaseTeamResponseIssue(this.githubIssue, this.teamAssigned);
      case Phase.phaseTesterResponse:
        return Issue.createPhaseTesterResponseIssue(this.githubIssue);
      case Phase.phaseModeration:
        return Issue.createPhaseModerationIssue(this.githubIssue, this.teamAssigned);
      default:
        return Issue.createPhaseBugReportingIssue(this.githubIssue);
    }
  }

  /**
   * Depending on the phase of the peer testing, each phase will have a response associated to them.
   * This function will allow the current instance of issue to retain the state of response of the given `issue`.
   *
   * @param phase - The phase in which you want to retain your responses.
   * @param issue - The issue which you want your current instance to retain from.
   */
  retainResponses(phase: Phase, issue: Issue) {
    this.issueComment = issue.issueComment;
    this.githubComments = issue.githubComments;
    switch (phase) {
      case Phase.phaseBugReporting:
        this.description = issue.description;
        break;
      case Phase.phaseTeamResponse:
        this.teamResponse = issue.teamResponse;
        break;
      case Phase.phaseTesterResponse:
        this.testerResponses = issue.testerResponses;
        this.teamResponse = issue.teamResponse;
        break;
      case Phase.phaseModeration:
        this.issueDisputes = issue.issueDisputes;
        break;
      default:
        break;
    }
  }

  /**
   * Updates the tester's responses and team response based on the given githubComment.
   * @param githubComment - A version of githubComment to update the issue with.
   */
  updateTesterResponse(githubComment: GithubComment): void {
    const template = new TesterResponseTemplate([githubComment]);
    this.issueComment = template.comment;
    this.teamResponse = template.teamResponse && template.teamResponse.content;
    this.testerResponses = template.testerResponse && template.testerResponse.testerResponses;
  }

  /**
   * Updates the tutor's resolution of the disputes with a new version of githubComment.
   * @param githubComment - A version of githubComment to update the dispute with.
   */
  updateDispute(githubComment: GithubComment): void {
    const todoTemplate = new TutorModerationTodoTemplate([githubComment]);
    this.issueComment = todoTemplate.comment;
    this.issueDisputes = todoTemplate.moderation.disputesToResolve.map((dispute, i) => {
      dispute.description = this.issueDisputes[i].description;
      return dispute;
    });
  }

  createGithubIssueDescription(): string {
    return `${this.description}\n${this.hiddenDataInDescription.toString()}`;
  }

  // Template url: https://github.com/CATcher-org/templates#dev-response-phase
  createGithubTeamResponse(): string {
    return `# Team\'s Response\n${this.teamResponse}\n` +
      `## Duplicate status (if any):\n${this.duplicateOf ? `Duplicate of #${this.duplicateOf}` : `--`}`;
  }

  // Template url: https://github.com/CATcher-org/templates#tutor-moderation
  createGithubTutorResponse(): string {
    let tutorResponseString = '# Tutor Moderation\n\n';
    for (const issueDispute of this.issueDisputes) {
      tutorResponseString += issueDispute.toTutorResponseString();
    }
    return tutorResponseString;
  }

  // Template url: https://github.com/CATcher-org/templates#teams-response-1
  createGithubTesterResponse(): string {
    return `# Team\'s Response\n${this.teamResponse}\n` +
      `# Items for the Tester to Verify\n${this.getTesterResponsesString(this.testerResponses)}`;
  }

  /**
   * Gets the number of unresolved disputes in an Issue.
   */
  numOfUnresolvedDisputes(): number {
    if (!this.issueDisputes) {
      return 0;
    }

    return this.issueDisputes.reduce((prev, current) => prev + Number(!current.isDone()), 0);
  }

  private getTesterResponsesString(testerResponses: TesterResponse[]): string {
    let testerResponsesString = '';
    for (const testerResponse of testerResponses) {
      testerResponsesString += testerResponse.toString();
    }
    return testerResponsesString;
  }
}

export interface Issues {
  [id: number]: Issue;
}

export const SEVERITY_ORDER = { '-': 0 , VeryLow: 1, Low: 2, Medium: 3, High: 4 };

export const ISSUE_TYPE_ORDER = { '-': 0 , DocumentationBug: 1, FeatureFlaw: 2, FunctionalityBug: 3  };

export enum STATUS {
  Incomplete = 'Incomplete',
  Done = 'Done',
}

export const IssuesFilter = {
  phaseBugReporting: {
    Student: 'FILTER_BY_CREATOR',
    Tutor: 'NO_FILTER',
    Admin: 'NO_FILTER',
  },
  phaseTeamResponse: {
    Student: 'FILTER_BY_TEAM',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  },
  phaseTesterResponse: {
    Student: 'NO_FILTER',
    Tutor: 'NO_ACCESS',
    Admin: 'NO_FILTER',
  },
  phaseModeration: {
    Student: 'NO_ACCESS',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  }
};
