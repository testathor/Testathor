import { IssueDispute } from '../../issue-dispute.model';
import { Section, SectionalDependency } from './section.model';

export class IssueDisputeSection extends Section {
  disputes: IssueDispute[] = [];

  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    super(sectionalDependency, unprocessedContent);
    if (!this.parseError) {
      let matches;
      const regex = /#{2} *:question: *(.*)[\r\n]*([\s\S]*?(?=-{19}))/gi;
      while (matches = regex.exec(this.content)) {
        if (matches) {
          const [_regexString, title, description] = matches;
          this.disputes.push(new IssueDispute(title, description.trim()));
        }
      }
    }
  }

  toString(): string {
    let toString = '';
    toString += `${this.header.toString()}\n`;
    for (const dispute of this.disputes) {
      toString += `${dispute.toString()}\n`;
    }
    return toString;
  }
}
