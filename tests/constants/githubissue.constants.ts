import { IssueState } from '../../graphql/graphql-types';
import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import { GithubLabel } from '../../src/app/core/models/github/github-label.model';
import { USER_ANUBHAV, USER_SHUMING } from './data.constants';
import { EMPTY_TEAM_RESPONSE, PENDING_TUTOR_MODERATION } from './githubcomment.constants';
import {
  GITHUB_LABEL_DOCUMENTATION_BUG,
  GITHUB_LABEL_FEATURE_FLAW,
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_HIGH_SEVERITY,
  GITHUB_LABEL_LOW_SEVERITY,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from './githublabel.constants';

const randomId: () => string = () => {
  return Math.floor(Math.random() * 1000000000).toString();
};

const randomIssueNumber: () => number = () => {
  return Math.round(Math.random() * 1000);
};

const randomISODate: (startDate?: Date, endDate?: Date) => string = (
  startDate: Date = new Date(2020, 1, 1),
  endDate: Date = new Date()
) => {
  return new Date(startDate.getTime() + Math.random() * (startDate.getTime() - endDate.getTime())).toISOString();
};

const USER_ANUBHAV_DETAILS = {
  login: USER_ANUBHAV.loginId,
  avatar_url: 'https://avatars1.githubusercontent.com/u/35621759?v=4',
  url: 'https://api.github.com/users/anubh-v'
};

const USER_ANUBHAV_ASSIGNEE_DETAILS = {
  login: USER_ANUBHAV.loginId,
  id: 35621759,
  url: 'https://api.github.com/users/anubh-v'
};

const USER_SHUMING_DETAILS = {
  login: USER_SHUMING.loginId,
  avatar_url: 'https://avatars0.githubusercontent.com/u/43642522?v=4',
  url: 'https://api.github.com/users/geshuming'
};

const USER_SHUMING_ASSIGNEE_DETAILS = {
  login: 'geshuming',
  id: 43642522,
  url: 'https://api.github.com/users/geshuming'
};

const ISSUE_BODY =
  '# Issue Description\n{original issue description}\n' +
  "# Team's Response\n{team's response}\n # Disputes\n\n" +
  "## :question: Issue Type\n\n### Team says:\r\n{the team's action that is being disputed}\r\n\r\n" +
  "### Tester says:\r\n{tester's objection}\n\n-------------------\n## :question: Issue Severity\n\n" +
  "### Team says:\r\n{the team's action that is being disputed}\r\n\r\n" +
  "### Tester says:\r\n{tester's objection}\n\n-------------------\n## :question: Not Related Question\n\n" +
  "### Team says:\r\n{the team's action that is being disputed}\r\n\r\n" +
  "### Tester says:\r\n{tester's objection}\n\n-------------------\n\n";

export const ISSUE_WITH_EMPTY_DESCRIPTION = new GithubIssue({
  id: '574085971',
  number: 92,
  assignees: [],
  comments: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-03-13T13:37:32Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/92',
  user: USER_ANUBHAV_DETAILS
});

export const ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY = new GithubIssue({
  id: '384830567',
  number: 130,
  assignees: [],
  comments: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FEATURE_FLAW, GITHUB_LABEL_LOW_SEVERITY],
  state: IssueState.Open,
  title: 'App is sometimes slow',
  updated_at: '2020-03-13T13:37:32Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS
});

export const ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY = new GithubIssue({
  id: '573957398',
  number: 32,
  assignees: [],
  comments: [],
  body: '',
  created_at: '2010-03-12T19:12:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_DOCUMENTATION_BUG, GITHUB_LABEL_HIGH_SEVERITY],
  state: IssueState.Open,
  title: 'Too many typos',
  updated_at: '2012-03-12T19:12:02Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS
});

export const DUPLICATED_ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY = new GithubIssue({
  id: '573957399',
  number: 33,
  assignees: [],
  comments: [],
  body: '',
  created_at: '2010-04-12T19:12:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_DOCUMENTATION_BUG, GITHUB_LABEL_HIGH_SEVERITY],
  state: IssueState.Open,
  title: 'Too many typos 2',
  updated_at: '2012-04-12T19:12:02Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS
});

export const ISSUE_WITH_ASSIGNEES = new GithubIssue({
  id: '551732011',
  number: 91,
  assignees: [USER_ANUBHAV_ASSIGNEE_DETAILS],
  body: 'Screen freezes every few minutes',
  created_at: '2020-01-18T07:01:45Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  title: 'Screen freezes',
  updated_at: '2020-03-02T12:50:02Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/91',
  user: USER_ANUBHAV_DETAILS,
  comments: [EMPTY_TEAM_RESPONSE]
});

export const generateIssueWithRandomData: () => GithubIssue = () => {
  const created_and_updated_date: string = randomISODate();
  const issueNumber: number = randomIssueNumber();
  const severityLabels: GithubLabel[] = [GITHUB_LABEL_LOW_SEVERITY, GITHUB_LABEL_MEDIUM_SEVERITY, GITHUB_LABEL_HIGH_SEVERITY];
  const typeLabels: GithubLabel[] = [GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_FEATURE_FLAW, GITHUB_LABEL_DOCUMENTATION_BUG];
  return new GithubIssue({
    id: randomId(),
    number: issueNumber,
    assignees: [],
    comments: [],
    body: `Issue No.: ${issueNumber}\nSample Content.`,
    created_at: created_and_updated_date,
    labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, typeLabels[issueNumber % 3], severityLabels[issueNumber % 3]],
    state: IssueState.Open,
    title: `Random Issue: ${issueNumber}`,
    updated_at: created_and_updated_date,
    url: `https://api.github.com/repos/CATcher-org/pe-results/issues/${issueNumber}`,
    user: USER_ANUBHAV_DETAILS
  });
};

export const ISSUE_PENDING_MODERATION = new GithubIssue({
  id: '574674360',
  number: 26,
  assignees: [USER_SHUMING_ASSIGNEE_DETAILS],
  body: ISSUE_BODY,
  created_at: '2020-03-03T13:38:32Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  title: 'Basic Issue, Three Disputes, Unsure',
  updated_at: '2020-08-15T06:39:40Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/26',
  user: USER_SHUMING_DETAILS,
  comments: [PENDING_TUTOR_MODERATION]
});

export const ISSUE_PENDING_MODERATION_HIGH_SEVERITY_FEATURE_FLAW = new GithubIssue({
  id: '239538360',
  number: 93,
  assignees: [USER_SHUMING_ASSIGNEE_DETAILS],
  body: ISSUE_BODY,
  created_at: '2020-10-14T10:28:32Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FEATURE_FLAW, GITHUB_LABEL_HIGH_SEVERITY],
  state: IssueState.Open,
  title: 'Redundant buggy feature',
  updated_at: '2020-11-25T13:19:40Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/26',
  user: USER_SHUMING_DETAILS,
  comments: [PENDING_TUTOR_MODERATION]
});

export const ISSUE_PENDING_MODERATION_LOW_SEVERITY_DOCUMENTATION_BUG = new GithubIssue({
  id: '384756360',
  number: 6,
  assignees: [USER_SHUMING_ASSIGNEE_DETAILS],
  body: ISSUE_BODY,
  created_at: '2020-03-26T09:08:12Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_DOCUMENTATION_BUG, GITHUB_LABEL_LOW_SEVERITY],
  state: IssueState.Open,
  title: 'Documentation bug, too many typos',
  updated_at: '2020-11-10T16:59:40Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/26',
  user: USER_SHUMING_DETAILS,
  comments: [PENDING_TUTOR_MODERATION]
});
