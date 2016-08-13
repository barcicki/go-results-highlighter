'use strict';

import GoResultsHighlighter from './lib/wrapper';
import { asArray } from './lib/utils';

// exactly one result per row is allowed
const CELL_RESULT_REGEXP = /^[^0-9]*([0-9]+[-+?])[^0-9]*$/;
const RESULT_REGEXP = /[0-9]+[-+?]/g;

/**
 * Applies highlighter to all elements matching given selector if they look like Go results.
 *
 * @param {string} selector - CSS-like selector
 * @param {boolean} [force=false] - whether the check for results should be ignored
 */
function applyHighlighter(selector, force) {
    const elementsWithGoResults = asArray(document.querySelectorAll(selector))
        .filter(/** Element */ element => {

            if (force) {
                return true;
            }

            // table element will be treated as results if any of its cells contain SINGLE result
            // string.
            if (element.nodeName === 'TABLE') {
                const cells = asArray(element.querySelectorAll('td'));
                const count = cells.length;

                for (let i = 0; i < count; i++) {
                    if (CELL_RESULT_REGEXP.test(cells[i].textContent)) {
                        console.log(element, cells[i], RegExp.$1);
                        return true;
                    }
                }

                return false;
            }

            // other element will be treated as results if it contains at least 6 Go results strings.
            const foundGoResults = element.textContent.match(RESULT_REGEXP);

            // why 6? I assume a tournament with at least 3 participants and 2 rounds.
            return foundGoResults && foundGoResults.length > 6;
        });

    if (!elementsWithGoResults.length) {
        let newSelector;

        // if force flag is set it means that user has tried to provide any selector
        if (force) {
            newSelector = prompt(`Could not find any elements matching "${selector}" selector. Do you want to provide another one?`);
        } else {
            newSelector = prompt(`Could not find any tables with Go results ("${selector}"). If you are confident that this page has one - please provide a specific selector to the element.`);
        }

        if (newSelector) {
            applyHighlighter(newSelector, true);
        } else {
            console.log('Could not find any elements with Go results.');
        }

        return;
    }

    elementsWithGoResults
        .forEach(element => new GoResultsHighlighter(element));

    console.log(`Go Results Highlighter applied to ${elementsWithGoResults.length} DOM elements.`);
}

applyHighlighter('table, pre');