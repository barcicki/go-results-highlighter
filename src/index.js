'use strict';

import GoResultsHighlighter from './plugin';
import { DOM_ATTRIBUTES } from './settings';
import { asArray } from './utils';

function initialize() {
    const resultElements = asArray(document.querySelectorAll(`[${DOM_ATTRIBUTES.RESULT_TABLE}]`));

    resultElements.forEach((tableEl) => {
        tableEl.goResultsHighlighter = new GoResultsHighlighter(tableEl);
    });
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

if (typeof jQuery !== 'undefined') {
    jQuery.fn.goResultsHighlighter = function (options) {
        this.each(function (index, element) {
            $(element).data('GoResultsHighlighter', new GoResultsHighlighter(element, options));
        });
        return this;
    };
}

export default GoResultsHighlighter;