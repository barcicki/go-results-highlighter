'use strict';

import GoResultsHighlighter from './plugin';
import { asArray } from './utils';

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