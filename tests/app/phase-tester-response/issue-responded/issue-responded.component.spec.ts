import { IssueComment } from '../../../../src/app/core/models/comment.model';
import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { IssueRespondedComponent } from '../../../../src/app/phase-tester-response/issue-responded/issue-responded.component';
import { USER_JUNWEI } from '../../../constants/data.constants';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';

describe('IssueRespondedComponent', () => {
  describe('.ngOnInit()', () => {
    const issuesRespondedComponent = new IssueRespondedComponent();
    issuesRespondedComponent.ngOnInit();
    const DUMMY_TEAM = USER_JUNWEI.team;
    const DUMMY_COMMENT: IssueComment = {
      id: 1,
      description: 'This is some description of an issue comment'
    };
    let dummyIssue: Issue;

    beforeEach(() => {
      // generate a well-formed dummy-issue
      // dummy issues does not have status and comment attributes
      dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, DUMMY_TEAM);
    });

    it('should set filter to return true for an issue that has a comment and is marked done', () => {
      // Issue with done status and a comment
      dummyIssue.status = STATUS.Done;
      dummyIssue.issueComment = DUMMY_COMMENT;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeTrue();
    });

    it('should set filter to return false for an issue that is not done and has a comment', () => {
      // Issue with no status but with comment
      dummyIssue.issueComment = DUMMY_COMMENT;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();

      // Issue with incomplete status and comment
      dummyIssue.status = STATUS.Incomplete;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for an issue that is marked done, and does not have a comment', () => {
      // Issue with done status and no comment
      dummyIssue.status = STATUS.Done;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for an issue that is not marked done, and does not have a comment', () => {
      // Issue with no status and no comment
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();

      // Issue with incomplete status and no comment
      dummyIssue.status = STATUS.Incomplete;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });
  });
});
