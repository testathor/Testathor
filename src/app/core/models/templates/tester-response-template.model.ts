import { Header, Template } from './template.model';
import { TesterResponseSection } from './sections/test-response-section.model';
import { Section } from './sections/section.model';
import { GithubComment } from '../github/github-comment.model';
import { IssueComment } from '../comment.model';
import { ParserService } from '../../services/parser.service';


export const TesterResponseHeaders = {
  teamResponse: new Header('Team\'s Response', 1),
  testerResponses: new Header('Items for the Tester to Verify', 1),
};

export class TesterResponseTemplate extends Template {
  teamResponse: Section;
  testerResponse: TesterResponseSection;
  comment: IssueComment;
  teamResponseSeverity: string;
  teamResponseType: string;

  constructor(githubIssueComments: GithubComment[]) {
    super(Object.values(TesterResponseHeaders));

    const templateConformingComment = githubIssueComments.find(comment => this.test(comment.body));
    if (templateConformingComment) {
      this.comment = <IssueComment>{
        ...templateConformingComment,
        description: templateConformingComment.body
      };
      this.teamResponse = this.parseTeamResponse(this.comment.description);
      this.testerResponse = this.parseTesterResponse(this.comment.description);
      this.teamResponseSeverity = this.parseteamResponseSeverity(this.comment.description);
      this.teamResponseType = this.parseteamResponseType(this.comment.description);

    }
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(TesterResponseHeaders.teamResponse), toParse);
  }

  parseTesterResponse(toParse: string): TesterResponseSection {
    return new TesterResponseSection(this.getSectionalDependency(TesterResponseHeaders.testerResponses), toParse);
  }

  parseteamResponseSeverity(toParse: string): string {
    return ParserService.parseGitHubCommentTeamResponseSeverity(toParse);
  }

  parseteamResponseType(toParse: string): string {
    return ParserService.parseGitHubCommentTeamResponseType(toParse);
  }
}
