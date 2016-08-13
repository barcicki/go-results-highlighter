'use strict';

import GoResultsHighlighter from './lib/wrapper';
import { DOM_ATTRIBUTES } from './lib/settings';
import { asArray } from './lib/utils';

function initialize() {
    const elementsWithResults = document.querySelectorAll(`[${DOM_ATTRIBUTES.RESULT_TABLE}]`);

    if (typeof jQuery !== 'undefined') {

        jQuery.fn.goResultsHighlighter = function (options) {
            this.each((index, element) => {
                const highlighter = new GoResultsHighlighter(element, options);

                $(highlighter.element).data('GoResultsHighlighter', highlighter);
            });
            return this;
        };

        jQuery(elementsWithResults).goResultsHighlighter();

    } else {
        asArray(elementsWithResults)
            .forEach(tableEl => new GoResultsHighlighter(tableEl));
    }
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

export default GoResultsHighlighter;