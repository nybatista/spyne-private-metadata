import { DomElementTemplate } from '../../spyne/views/dom-element-template';

// Evaluate once at the top
const isPublic = process.env.IS_PUBLIC === true;


// If not public, skip this test suite altogether
(isPublic ? describe : describe.skip)('DomElementTemplate Proxy (Public Test)', () => {
  it('should not have a proxy method', () => {
    expect(DomElementTemplate.hasOwnProperty('formatTemplateForProxyData')).to.be.false;
  });
});

(!isPublic ? describe : describe.skip)('DomElementTemplate Proxy (Internal Test)', () => {
  describe('formatTemplateForProxyData', () => {
    it('should wrap text-node placeholders like <h1>{{title}}</h1> in <spyne-cms-item>', () => {
      const input = '<h1>{{title}}</h1>';
      const output = DomElementTemplate.formatTemplateForProxyData(input);

      // wrapper exists
      expect(output).to.include('<spyne-cms-item');

      // text is preserved inside the CMS text wrapper
      expect(output).to.include(
        '<spyne-cms-item-text>{{title}}</spyne-cms-item-text>'
      );

      // structural sanity check
      expect(output).to.include('</spyne-cms-item>');
    });

    it('should NOT wrap attribute placeholders like <img src="{{imgUrl}}"> and keep them intact', () => {
      const input = '<img src="{{imgUrl}}">';
      const output = DomElementTemplate.formatTemplateForProxyData(input);

      // attributes must remain untouched
      expect(output).to.equal(input);
      expect(output).to.not.include('<spyne-cms-item');
    });
  });
});
