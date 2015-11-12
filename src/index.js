'use strict';

import GoResultsHighlighter from './plugin';
import { DOM_ATTRIBUTES } from './settings';
import { asArray } from './utils';

function initialize() {
    asArray(document.querySelectorAll(`[${DOM_ATTRIBUTES.RESULT_TABLE}]`))
        .forEach((tableEl) => new GoResultsHighlighter(tableEl));
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

if (typeof jQuery !== 'undefined') {
    jQuery.fn.goResultsHighlighter = function (options) {
        this.each(function (index, element) {
            let highlighter = new GoResultsHighlighter(element, options);

            $(highlighter.element).data('GoResultsHighlighter', highlighter);
        });
        return this;
    };
}

export default GoResultsHighlighter;