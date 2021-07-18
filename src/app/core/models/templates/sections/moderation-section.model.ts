import { IssueDispute } from '../../issue-dispute.model';
import { Section, SectionalDependency } from './section.model';

export class ModerationSection extends Section {
  disputesToResolve: IssueDispute[] = [];

  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    super(sectionalDependency, unprocessedContent);
    if (!this.parseError) {
      let matches;
      const regex = /#{2} *:question: *(.*)[\n\r]*(.*)[\n\r]*([\s\S]*?(?=-{19}))/gi;
      while (matches = regex.exec(this.content)) {
        if (matches) {
          const [_regexString, title, todo, tutorResponse] = matches;
          const description = `${todo}\n${tutorResponse}`;
          const newDispute = new IssueDispute(title, description);

          newDispute.todo = todo;
          newDispute.tutorResponse = tutorResponse.trim();
          this.disputesToResolve.push(newDispute);
        }
      }
    }
  }

  get todoList(): string[] {
    return this.disputesToResolve.map(e => e.todo);
  }

  toString(): string {
    let toString = '';
    toString += `${this.header.toString()}\n`;
    for (const dispute of this.disputesToResolve) {
      toString += `${dispute.toTutorResponseString()}\n`;
    }
    return toString;
  }
}
