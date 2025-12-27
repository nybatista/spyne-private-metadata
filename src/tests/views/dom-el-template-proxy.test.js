import { DomElementTemplate } from '../../spyne/views/dom-element-template';

describe('DomElementTemplate Proxy (CMS)', () => {
  it('exposes the proxy API', () => {
    expect(DomElementTemplate.formatTemplateForProxyData).to.be.a('function');
  });

  it('wraps text-node placeholders in <spyne-cms-item>', () => {
    const input = '<h1>{{title}}</h1>';
    const output = DomElementTemplate.formatTemplateForProxyData(input);

    expect(output).to.include('<spyne-cms-item');
    expect(output).to.include(
      '<spyne-cms-item-text>{{title}}</spyne-cms-item-text>'
    );
  });

  it('does not wrap attribute placeholders', () => {
    const input = '<img src="{{imgUrl}}">';
    const output = DomElementTemplate.formatTemplateForProxyData(input);

    expect(output).to.equal(input);
  });

  it('allows attr* placeholders without wrapping', () => {
    const input = '<img src="{{attrImgSrc}}" alt="{{attrImgAlt}}">';
    const output = DomElementTemplate.formatTemplateForProxyData(input);

    expect(output).to.not.include('<spyne-cms-item');
  });

  it('preserves loop root structure', () => {
    const input = `
      <ul>
        {{#items}}
          <li><span>{{title}}</span></li>
        {{/items}}
      </ul>
    `;

    const tmpl = new DomElementTemplate(input, {
      __cms__isProxy: true,
      items: [{ title: 'A' }, { title: 'B' }]
    });

    const output = tmpl.renderToString();
    expect(output.match(/<li>/g).length).to.equal(2);
  });
});
