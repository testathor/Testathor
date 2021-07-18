import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { TABLE_COLUMNS } from './issue-tables-columns';

/**
 * This module serves to improve separation of concerns in IssuesDataTable.ts module by containing the logic for
 * applying search filter to the issues data table in this module.
 * This module exports a single function applySearchFilter which is called by IssuesDataTable.
 */
export function applySearchFilter(filter: string, displayedColumn: string[], issueService: IssueService, data: Issue[]): Issue[] {
    const searchKey = filter.toLowerCase();
    const result = data.slice().filter((issue: Issue) => {
      for (const column of displayedColumn) {
        switch (column) {
          case TABLE_COLUMNS.ASSIGNEE:
            if (matchesAssignee(issue.assignees, searchKey)) {
              return true;
            }
            break;
          case TABLE_COLUMNS.DUPLICATED_ISSUES:
            if (matchesDuplicatedIssue(issueService, issue.id, searchKey)) {
              return true;
            }
            break;
          default:
            if (matchesOtherColumns(issue, column, searchKey)) {
              return true;
            }
            break;
        }
      }
      return false;
    });
    return result;
}

function containsSearchKey(item: string, searchKey: string): boolean {
  return item.indexOf(searchKey) !== -1;
}

function duplicatedIssuesContainsSearchKey(duplicatedIssues: Issue[], searchKey: string): boolean {
  return duplicatedIssues.filter(el => `#${String(el.id)}`.includes(searchKey)).length !== 0;
}

function matchesAssignee(assignees: string[], searchKey: string): boolean {
  for (const assignee of assignees) {
    const lowerCaseAssignee = assignee.toLowerCase();
    return containsSearchKey(lowerCaseAssignee, searchKey);
  }
}

function matchesDuplicatedIssue(issueService: IssueService, id: number, searchKey: string): boolean {
  const duplicatedIssues = issueService.issues$.getValue().filter(el => el.duplicateOf === id);
  return duplicatedIssuesContainsSearchKey(duplicatedIssues, searchKey);
}

function matchesOtherColumns(issue: Issue, column: string, searchKey: string): boolean {
  const searchStr = String(issue[column]).toLowerCase();
  return containsSearchKey(searchStr, searchKey);
}
