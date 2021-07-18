import { diff_match_patch } from 'diff-match-patch';
import { escapeHTML, replaceNewlinesWithBreakLines } from '../../../shared/lib/html';
import { Addition } from './addition.model';
import { Changes } from './changes.model';
import { NoChange } from './no-change.model';
import { Removal } from './removal.model';

/**
 * A model to represent the difference/conflict between two text.
 */
export class Conflict {
  outdatedContent: string;
  updatedContent: string;
  changes: Changes[] = [];

  constructor(outdatedContent: string, updatedContent: string) {
    this.outdatedContent = outdatedContent;
    this.updatedContent = updatedContent;

    const matcher = new diff_match_patch();
    const diffs = matcher.diff_main(outdatedContent, updatedContent);
    matcher.diff_cleanupSemantic(diffs);
    for (const diff of diffs) {
      if (diff[0] === -1) {
        this.changes.push(new Removal(diff[1]));
      } else if (diff[0] === 1) {
        this.changes.push(new Addition(diff[1]));
      } else {
        this.changes.push(new NoChange(diff[1]));
      }
    }
  }

  getHtmlDiffString(): string {
    let result = '';
    for (const change of this.changes) {
      result += change.getHtmlString();
    }
    return replaceNewlinesWithBreakLines(result);
  }

  getHtmlUpdatedString(): string {
    return replaceNewlinesWithBreakLines(escapeHTML(this.updatedContent));
  }
}
