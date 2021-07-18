import { GithubIssue } from '../github/github-issue.model';
import { IssueDisputeSection } from './sections/issue-dispute-section.model';
import { Section } from './sections/section.model';
import { Header, Template } from './template.model';


const tutorModerationIssueDescriptionHeaders = {
  description: new Header('Issue Description', 1),
  teamResponse: new Header('Team\'s Response', 1),
  disputes: new Header('Disputes', 1)
};

export class TutorModerationIssueTemplate extends Template {
  description: Section;
  teamResponse: Section;
  dispute: IssueDisputeSection;

  constructor(githubIssue: GithubIssue) {
    super(Object.values(tutorModerationIssueDescriptionHeaders));

    const issueContent = githubIssue.body;
    this.description = this.parseDescription(issueContent);
    this.teamResponse = this.parseTeamResponse(issueContent);
    this.dispute = this.parseDisputes(issueContent);
  }

  parseDescription(toParse: string): Section {
    return new Section(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.description), toParse);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.teamResponse), toParse);
  }

  parseDisputes(toParse: string): IssueDisputeSection {
    return new IssueDisputeSection(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.disputes), toParse);
  }
}
