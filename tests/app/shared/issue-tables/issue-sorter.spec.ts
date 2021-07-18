import { MatSort } from '@angular/material';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { getSortedData } from '../../../../src/app/shared/issue-tables/issue-sorter';
import { TEAM_4 } from '../../../constants/data.constants';
import { ISSUE_PENDING_MODERATION, ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';

describe('issuer-sorter', () => {
  describe('getSortedData()', () => {
    const dummyTeam = TEAM_4;
    const dummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    const otherDummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const issuesList: Issue[] = [dummyIssue, otherDummyIssue];

    const moderationIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    const otherModerationIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_PENDING_MODERATION, dummyTeam);
    const todoIssuesList: Issue[] = [moderationIssue, otherModerationIssue];
    const matSort: MatSort = new MatSort();

    it('sorts issues based on their assignees correctly', () => {
      matSort.active = 'assignees';
      matSort.direction = 'asc';
      const sortedIssuesByAssigneesAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByAssigneesAsc, dummyIssue, otherDummyIssue);

      matSort.direction = 'desc';
      const sortedIssuesByAssigneesDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByAssigneesDesc, otherDummyIssue, dummyIssue);
    });

    it('sorts issues based on their string fields correctly', () => {
      matSort.active = 'title';
      matSort.direction = 'asc';
      const sortedIssuesByTitleAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByTitleAsc, dummyIssue, otherDummyIssue);

      matSort.direction = 'desc';
      const sortedIssuesByTitleDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByTitleDesc, otherDummyIssue, dummyIssue);
    });

    it('sorts issues based on their integer fields correctly', () => {
      matSort.active = 'id';
      matSort.direction = 'asc';
      const sortedIssuedByIdAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuedByIdAsc, otherDummyIssue, dummyIssue);

      matSort.direction = 'desc';
      const sortedIssuedByIdDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuedByIdDesc, dummyIssue, otherDummyIssue);
    });

    it('sorts issues based on their todos left correctly', () => {
      matSort.active = 'Todo Remaining';
      matSort.direction = 'asc';
      const sortedIssuesByTodoAsc = getSortedData(matSort, todoIssuesList);
      assertOrder(sortedIssuesByTodoAsc, otherModerationIssue, moderationIssue);

      matSort.direction = 'desc';
      const sortedIssuesByTodoDesc = getSortedData(matSort, todoIssuesList);
      assertOrder(sortedIssuesByTodoDesc, moderationIssue, otherModerationIssue);
    });
  });
});

/**
 * This helper method helps to check if the sorted issues are in their
 * correct order based on the variable arguments provided.
 */
function assertOrder(sortedIssues: Issue[], ...expectedSortedIssues: Issue[]) {
  for (let i = 0; i < sortedIssues.length; i++) {
    expect(sortedIssues[i].id).toBe(expectedSortedIssues[i].id);
  }
}
