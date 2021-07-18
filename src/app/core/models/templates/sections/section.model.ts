/**
 * A SectionalDependency defines a format that is needed to create a successful Section in a template.
 * It will require the Section's header to be defined and the other headers that are present in the template.
 *
 * Reason for the dependencies on other headers: We need them to create a regex expression that is capable of parsing the current
 *                                               section out of the string.
 */
import { Header } from '../template.model';

export interface SectionalDependency {
  sectionHeader: Header;
  remainingTemplateHeaders: Header[];
}

export class Section {
  header: Header;
  sectionRegex: RegExp;
  content: string;
  parseError: string;

  /**
   *
   * @param sectionalDependency The dependency that is need to create a section's regex
   * @param unprocessedContent The string that stores the section's amongst other things
   */
  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    this.header = sectionalDependency.sectionHeader;
    // If length === 0, match till end of string else match till regex hits another section
    const matchTillRegex = sectionalDependency.remainingTemplateHeaders.length === 0 ? '$'
      : sectionalDependency.remainingTemplateHeaders.join('|');
    this.sectionRegex = new RegExp(`(${this.header})\\s+([\\s\\S]*?)(?=${matchTillRegex}|$)`, 'i');
    const matches = this.sectionRegex.exec(unprocessedContent);
    if (matches) {
      const [_originalString, _header, description] = matches;
      this.content = description.trim();
      this.parseError = null;
    } else {
      this.content = null;
      this.parseError = `Unable to extract ${this.header.name} Section`;
    }
  }
}
