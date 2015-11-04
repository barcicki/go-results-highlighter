'use strict';

import GoResultsHighlighter, { asArray } from './plugin';

function initialize() {
    const resultElements = asArray(document.querySelectorAll('[go-results],[data-go-results]'));

    resultElements.forEach((tableEl) => {
        tableEl.goResultsHighlighter = new GoResultsHighlighter(tableEl);
    });
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

export default GoResultsHighlighter;