import { TesterResponse } from '../../tester-response.model';
import { Section, SectionalDependency } from './section.model';

export class TesterResponseSection extends Section {
  testerResponses: TesterResponse[] = [];

  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    super(sectionalDependency, unprocessedContent);
    if (!this.parseError) {
      let matches;
      const regex: RegExp = new RegExp('#{2} *:question: *([\\w ]+)[\\r\\n]*(Team Chose.*[\\r\\n]* *Originally.*'
        + '|Team Chose.*[\\r\\n]*)[\\r\\n]*(- \\[x? ?\\] I disagree)[\\r\\n]*\\*\\*Reason *for *disagreement:\\*\\* *([\\s\\S]*?)'
        + '[\\n\\r]-{19}',
        'gi');
      while (matches = regex.exec(this.content)) {
        if (matches) {
          const [_regexString, title, description, disagreeCheckbox, reasonForDisagreement] = matches;
          this.testerResponses.push(new TesterResponse(title, description, disagreeCheckbox, reasonForDisagreement.trim()));
        }
      }
    }
  }

  toString(): string {
    let toString = '';
    toString += `${this.header.toString()}\n`;
    for (const response of this.testerResponses) {
      toString += `${response.toString()}\n`;
    }
    return toString;
  }
}
