import { Issue } from '../../../../src/app/core/models/issue.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { IssuesFaultyComponent } from '../../../../src/app/phase-team-response/issues-faulty/issues-faulty.component';
import { TEAM_3, TEAM_4, USER_Q } from '../../../constants/data.constants';
import { generateIssueWithRandomData, ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';

describe('IssuesFaultyComponent', () => {
  describe('.ngOnInit()', () => {
    const dummyTeam = TEAM_4;
    const dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    let issueService: IssueService;
    let issuesFaultyComponent: IssuesFaultyComponent;
    const userService = new UserService(null, null);
    userService.currentUser = USER_Q;
    const DUMMY_DUPLICATE_ISSUE_ID = 1;
    const DUMMY_RESPONSE = 'dummy response';

    beforeEach(() => {
      issueService = new IssueService(null, null, null, null, null);
      issueService.updateLocalStore(dummyIssue);
      issuesFaultyComponent = new IssuesFaultyComponent(issueService, userService, null);
      issuesFaultyComponent.ngOnInit();
    });

    it('should set filter to return false for an issue with no team response', () => {
      const testIssue = { ...dummyIssue, teamResponse: undefined } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return false for a non-duplicate issue with responses', () => {
      const testIssue = { ...dummyIssue, teamResponse: DUMMY_RESPONSE, duplicateOf: undefined } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return false for a duplicate issue with responses that is not duplicated by other issues', () => {
      const testIssue = {
        ...dummyIssue,
        teamResponse: DUMMY_RESPONSE,
        duplicateOf: DUMMY_DUPLICATE_ISSUE_ID
      } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return true for a duplicate issue with responses that is duplicated by other issues', () => {
      const testIssue = {
        ...Issue.createPhaseTeamResponseIssue(generateIssueWithRandomData(), TEAM_3),
        duplicateOf: dummyIssue.id,
        teamResponse: DUMMY_RESPONSE
      } as Issue;
      issueService.updateLocalStore(testIssue);

      const duplicateOfTestIssue = {
        ...Issue.createPhaseTeamResponseIssue(generateIssueWithRandomData(), TEAM_3),
        duplicateOf: testIssue.id
      } as Issue;
      issueService.updateLocalStore(duplicateOfTestIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeTrue();
    });
  });
});
