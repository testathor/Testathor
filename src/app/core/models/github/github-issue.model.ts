import { IssueState } from '../../../../../graphql/graphql-types';
import { GithubComment } from './github-comment.model';
import { GithubLabel } from './github-label.model';

export class GithubIssue {
  id: string; // Github's backend's id
  number: number; // Issue's display id
  assignees: Array<{
    id: number,
    login: string,
    url: string,
  }>;
  body: string;
  created_at: string;
  labels: Array<GithubLabel>;
  state: IssueState;
  title: string;
  updated_at: string;
  url: string;
  user: { // Author of the issue
    login: string,
    avatar_url: string,
    url: string,
  };
  comments: Array<GithubComment>;

  constructor(githubIssue: {}) {
    Object.assign(this, githubIssue);
    this.labels = [];
    for (const label of githubIssue['labels']) {
      this.labels.push(new GithubLabel(label));
    }
  }

  /**
   *
   * @param name Depending on the isCategorical flag, this name either refers to the category name of label or the exact name of label.
   * @param isCategorical Whether the label is categorical.
   */
  findLabel(name: string, isCategorical: boolean = true): string {
    if (!isCategorical) {
      const label = this.labels.find(l => (!l.isCategorical() && l.name === name));
      return label ? label.getValue() : undefined;
    }

    // Find labels with the same category name as what is specified in the parameter.
    const labels = this.labels.filter(l => (l.isCategorical() && l.getCategory() === name));
    if (labels.length === 0) {
      return undefined;
    } else if (labels.length === 1) {
      return labels[0].getValue();
    } else {
      // If Label order is not specified, return the first label value else
      // If Label order is specified, return the highest ranking label value
      if (!GithubLabel.LABEL_ORDER[name]) {
        return labels[0].getValue();
      } else {
        const order = GithubLabel.LABEL_ORDER[name];
        return labels.reduce((result, currLabel) => {
          return order[currLabel.getValue()] > order[result.getValue()] ? currLabel : result;
        }).getValue();
      }
    }
  }

  findTeamId(): string {
    return `${this.findLabel('team')}.${this.findLabel('tutorial')}`;
  }
}
