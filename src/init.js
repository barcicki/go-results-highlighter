import GoResultsHighlighter from './lib/wrapper';
import { DOM_ATTRIBUTES } from './lib/settings';
import { asArray } from './lib/utils';

const GO_RESULTS_SELECTOR = `[${DOM_ATTRIBUTES.RESULT_TABLE}]`;

export function initWithJQuery(jQuery) {
  // register goResultsHighlighter plugin in jQuery
  jQuery.fn.goResultsHighlighter = function jQueryHighlighterWrapper(options) {
    this.each((index, element) => {
      const highlighter = new GoResultsHighlighter(element, options);

      jQuery(highlighter.element).data('GoResultsHighlighter', highlighter);
    });

    return this;
  };

  jQuery(() => {
    jQuery(GO_RESULTS_SELECTOR).goResultsHighlighter();
  });
}

export function init(document) {
  if (document.readyState === 'complete') {
    bind();
  } else {
    document.addEventListener('DOMContentLoaded', bind, false);
  }

  function bind() {
    asArray(document.querySelectorAll(GO_RESULTS_SELECTOR))
      .forEach((tableEl) => new GoResultsHighlighter(tableEl));
  }
}
