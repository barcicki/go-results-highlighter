import GoResultsHighlighter, { asArray } from './plugin';

function initialize() {
    const resultElements = asArray(document.querySelectorAll('[go-results],[data-go-results]'));

    for (let tableEl of resultElements) {
        tableEl.goResultsHighlighter = new GoResultsHighlighter(tableEl);
    }
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

export default GoResultsHighlighter;