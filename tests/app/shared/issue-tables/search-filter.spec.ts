import { Issue } from '../../../../src/app/core/models/issue.model';
import { Team } from '../../../../src/app/core/models/team.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { TABLE_COLUMNS } from '../../../../src/app/shared/issue-tables/issue-tables-columns';
import { applySearchFilter } from '../../../../src/app/shared/issue-tables/search-filter';
import { USER_ANUBHAV } from '../../../constants/data.constants';
import {
  DUPLICATED_ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
  ISSUE_WITH_ASSIGNEES,
  ISSUE_WITH_EMPTY_DESCRIPTION,
  ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
  ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY
} from '../../../constants/githubissue.constants';

describe('search-filter', () => {
  describe('applySearchFilter()', () => {
    const dummyTeam: Team = new Team({
      id: 'dummyId',
      teamMembers: []
    });
    let searchKey: string;
    const mediumSeverityIssueWithResponse: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    mediumSeverityIssueWithResponse.responseTag = 'Accepted';
    const mediumSeverityIssueWithAssigneee: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const lowSeverityFeatureFlawIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY, dummyTeam);
    const highSeverityDocumentationBugIssue: Issue = Issue.createPhaseTeamResponseIssue(
      ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
      dummyTeam
    );
    const duplicatedIssue: Issue = Issue.createPhaseTeamResponseIssue(DUPLICATED_ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, dummyTeam);
    duplicatedIssue.duplicateOf = highSeverityDocumentationBugIssue.id;

    const issuesList: Issue[] = [
      mediumSeverityIssueWithResponse,
      mediumSeverityIssueWithAssigneee,
      lowSeverityFeatureFlawIssue,
      highSeverityDocumentationBugIssue
    ];
    const displayedColumns: string[] = [
      TABLE_COLUMNS.ID,
      TABLE_COLUMNS.TITLE,
      TABLE_COLUMNS.TYPE,
      TABLE_COLUMNS.SEVERITY,
      TABLE_COLUMNS.RESPONSE,
      TABLE_COLUMNS.ASSIGNEE,
      TABLE_COLUMNS.DUPLICATED_ISSUES
    ];
    const issueService: IssueService = new IssueService(null, null, null, null, null);

    beforeEach(() => {
      issueService.updateLocalStore(mediumSeverityIssueWithResponse);
      issueService.updateLocalStore(mediumSeverityIssueWithAssigneee);
      issueService.updateLocalStore(lowSeverityFeatureFlawIssue);
      issueService.updateLocalStore(highSeverityDocumentationBugIssue);
      issueService.updateLocalStore(duplicatedIssue);
    });

    it('can filter for issues which are assigned to a specific user', () => {
      searchKey = USER_ANUBHAV.loginId;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithAssigneee]);
    });

    it('can filter for an issue by the id of its duplicate issues', () => {
      searchKey = duplicatedIssue.id.toString();
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([highSeverityDocumentationBugIssue]);
    });

    it('can filter for issues that contain the search key in any other column', () => {
      // Search by id of issue
      searchKey = mediumSeverityIssueWithResponse.id.toString();
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithResponse]);

      // Search by title of issue
      searchKey = mediumSeverityIssueWithAssigneee.title;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithAssigneee]);

      // Search by type of issue
      searchKey = highSeverityDocumentationBugIssue.type;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([highSeverityDocumentationBugIssue]);

      // Search by severity of issue
      searchKey = lowSeverityFeatureFlawIssue.severity;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([lowSeverityFeatureFlawIssue]);

      // Search by response of issue
      searchKey = mediumSeverityIssueWithResponse.responseTag;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithResponse]);
    });
  });
});
