import GoResultsHighlighter from './lib/wrapper';
import styles from '!!raw-loader!sass-loader!./styles/component.scss';

export class GoResultsWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${styles}</style><slot></slot><div id="go-results-wrapper"></div>`;
  }

  connectedCallback() {
    const slot = this.shadowRoot.querySelector('slot');
    const wrapper = this.shadowRoot.getElementById('go-results-wrapper');

    slot.onslotchange = () => {
      const settings = {
        placeColumn: readAttr(this, 'place-column', Number, null),
        roundsColumns: readAttr(this, 'rounds-columns', null, null),
        startingRow: readAttr(this, 'starting-row', Number, 0)
      };

      Array.from(slot.assignedNodes()).forEach((node) => {
        const clone = node.cloneNode(true);

        wrapper.appendChild(clone);

        new GoResultsHighlighter(clone, settings);
      });
    };
  }
}

customElements.define('go-results', GoResultsWebComponent);

function readAttr(node, attr, mapper, fallback) {
  if (node.hasAttribute(attr)) {
    const value = node.getAttribute(attr);

    return (typeof mapper === 'function') ? mapper(value) : value;
  }

  return fallback;
}
