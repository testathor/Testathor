import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { IssuesRespondedComponent } from '../../../../src/app/phase-team-response/issues-responded/issues-responded.component';
import { TEAM_4, USER_Q } from '../../../constants/data.constants';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';

describe('IssuesRespondedComponent', () => {
  describe('.ngOnInit()', () => {
    const DUMMY_TEAM = TEAM_4;
    const DUMMY_DUPLICATE_ISSUE_ID = 1;
    const DUMMY_RESPONSE = 'dummy response';
    let dummyIssue: Issue;

    const issueService = new IssueService(null, null, null, null, null);
    const userService = new UserService(null, null);
    userService.currentUser = USER_Q;
    const issuesRespondedComponent = new IssuesRespondedComponent(issueService, userService);
    issuesRespondedComponent.ngOnInit();

    beforeEach(() => {
      dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, DUMMY_TEAM);
      issueService.updateLocalStore(dummyIssue);
    });

    it('should set filter to return false for a non-duplicate issue with no team response and not marked done', () => {
      dummyIssue.duplicateOf = undefined;
      dummyIssue.status = undefined;
      dummyIssue.teamResponse = undefined;

      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for a non-duplicate issue with responses and not marked done', () => {
      dummyIssue.duplicateOf = undefined;
      dummyIssue.status = undefined;
      dummyIssue.teamResponse = DUMMY_RESPONSE;

      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for a duplicate issue with no team response and not marked done', () => {
      dummyIssue.duplicateOf = DUMMY_DUPLICATE_ISSUE_ID;
      dummyIssue.status = undefined;
      dummyIssue.teamResponse = undefined;

      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();

      dummyIssue.duplicateOf = DUMMY_DUPLICATE_ISSUE_ID;
      dummyIssue.status = STATUS.Incomplete;
      dummyIssue.teamResponse = undefined;

      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return true for a non-duplicate issue that is marked done with a team response', () => {
      dummyIssue.duplicateOf = undefined;
      dummyIssue.status = STATUS.Done;
      dummyIssue.teamResponse = DUMMY_RESPONSE;

      expect(issuesRespondedComponent.filter(dummyIssue)).toBeTrue();
    });
  });
});
