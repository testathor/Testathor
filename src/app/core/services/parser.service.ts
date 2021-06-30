import { Injectable } from '@angular/core';

/**
 * Parser Service used for parsing strings and retrieving keywords
 */
@Injectable({
  providedIn: 'root'
})
export class ParserService {

  /**
   * Variables related to the keywords to look out for within a github comment containing this dispute.
   * Variables include issue dispute headers.
   */
  public static readonly ISSUE_SEVERITY_DISPUTE_START_STRING = '## :question: Issue severity';
  public static readonly ISSUE_TYPE_DISPUTE_START_STRING = '## :question: Issue type';
  public static readonly TEAM_RESPOND_TYPE_PREFIX = 'Team chose [`type.';
  public static readonly TEAM_RESPOND_TYPE_SUFFIX = "`]";
  public static readonly TEAM_RESPOND_SEVERITY_PREFIX = 'Team chose [`severity.';
  public static readonly TEAM_RESPOND_SEVERITY_SUFFIX = "`]";
  public static readonly DISPUTE_END_DELIMTER = "-------------------"; // According to github comment

  constructor() {
  }

  /**
   * Returns the value of the severity the team responded with by parsing the issue dispute comment.
   */
  static parseGitHubCommentTeamResponseSeverity(input: string): string {
      return ParserService.parseGitHubCommentIssueDisputeParser(input, ParserService.ISSUE_SEVERITY_DISPUTE_START_STRING,
        ParserService.DISPUTE_END_DELIMTER, ParserService.TEAM_RESPOND_SEVERITY_PREFIX, ParserService.TEAM_RESPOND_SEVERITY_SUFFIX);
  }

  /**
   * Returns the value of the type the team responded with by parsing the issue dispute comment.
   */
  static parseGitHubCommentTeamResponseType(input: string): string {
    return ParserService.parseGitHubCommentIssueDisputeParser(input, ParserService.ISSUE_TYPE_DISPUTE_START_STRING,
      ParserService.DISPUTE_END_DELIMTER, ParserService.TEAM_RESPOND_TYPE_PREFIX, ParserService.TEAM_RESPOND_TYPE_SUFFIX);
  }

  /**
   * Returns the value of the keyword we are looking for using string matching
   * on the issue dispute comment on github
   *
   * @param input the string input to be parsed
   * @param section_start a string indicating the section to start the search at
   * @param section_end a string indicating the section that is search
   * @param prefix prefix of the word that is being searched
   * @param suffix suffix of the word that is being searched
   * @returns a string representing the parsed value
   */
  private static parseGitHubCommentIssueDisputeParser(input: string, section_start: string, section_end: string, prefix: string,
    suffix: string): string {
    // Find start of the section we are looking for, issue type or issue severity dispute
    const startIdx = input.lastIndexOf(section_start);

    if (startIdx === -1) {
      return "";
    }

    // Get the dispute type text: issue type or severity
    let contentToFindIn = input.substring(startIdx);

    const endIdx = contentToFindIn.indexOf(section_end);

    // Get the string containing just the issue dispute type we are looking at
    contentToFindIn = contentToFindIn.substring(0, endIdx);

    const prefixIdx = contentToFindIn.indexOf(prefix) + prefix.length;

    contentToFindIn = contentToFindIn.substring(prefixIdx);

    const suffixIdx = contentToFindIn.indexOf(suffix);

    // Get the value we are looking for
    return contentToFindIn.substring(0, suffixIdx);
  }

}
