import { Addition } from '../../../../../src/app/core/models/conflict/addition.model';
import { Conflict } from '../../../../../src/app/core/models/conflict/conflict.model';
import { NoChange } from '../../../../../src/app/core/models/conflict/no-change.model';
import { Removal } from '../../../../../src/app/core/models/conflict/removal.model';
import { replaceNewlinesWithBreakLines } from '../../../../../src/app/shared/lib/html';

describe('TitleComponent', () => {
  let longerString: string;
  let shorterString: string;

  let additionalCharacters: string;
  let conflict: Conflict;

  beforeEach(() => {
    additionalCharacters = ' Sample Text';
    shorterString = 'Some Content that I would want to insert my java \n here';
    longerString = shorterString + additionalCharacters;
  });

  it('should return a diff string with no conflicts with given the same string', () => {
    conflict = new Conflict(longerString, longerString);
    const noChangeConflict = new NoChange(longerString);
    const noConflictString = replaceNewlinesWithBreakLines(noChangeConflict.getHtmlString());

    expect(conflict.getHtmlDiffString().includes(noConflictString)).toEqual(true);
  });

  it('should return a diff string with Removal conflicts with given the same string with removed characters', () => {
    conflict = new Conflict(longerString, shorterString);
    const noChangeConflict = new NoChange(shorterString);
    const noConflictString = replaceNewlinesWithBreakLines(noChangeConflict.getHtmlString());
    const removalConflict = new Removal(additionalCharacters);
    const removalConflictString = replaceNewlinesWithBreakLines(removalConflict.getHtmlString());

    expect(conflict.getHtmlDiffString().includes(noConflictString)).toEqual(true);
    expect(conflict.getHtmlDiffString().includes(removalConflictString)).toEqual(true);
  });

  it('should return a diff string with Addition conflicts with given the same string with additions', () => {
    conflict = new Conflict(shorterString, longerString);
    const noChangeConflict = new NoChange(shorterString);
    const noConflictString = replaceNewlinesWithBreakLines(noChangeConflict.getHtmlString());
    const additionConflict = new Addition(additionalCharacters);
    const additionConflictString = replaceNewlinesWithBreakLines(additionConflict.getHtmlString());

    expect(conflict.getHtmlDiffString().includes(noConflictString)).toEqual(true);
    expect(conflict.getHtmlDiffString().includes(additionConflictString)).toEqual(true);
  });
});
