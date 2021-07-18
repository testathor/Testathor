import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { markedOptionsFactory } from '../../../../src/app/shared/lib/marked';

describe('markedOptionsFactory', () => {
  const markedOptions: MarkedOptions = markedOptionsFactory();
  const renderer: MarkedRenderer = markedOptions.renderer;

  const CUSTOM_LINK = 'www.google.com';
  const CUSTOM_TITLE = 'google';
  const CUSTOM_TEXT = 'link here';

  it('should append all links with target=_blank', () => {
    const htmlOutput: string = renderer.link(CUSTOM_LINK, CUSTOM_TITLE, CUSTOM_TEXT);
    expect(htmlOutput).toContain('target="_blank"');
  });
});
