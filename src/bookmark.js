'use strict';

import GoResultsHighlighter from './lib/wrapper';
import { asArray } from './lib/utils';
import './styles/bookmark.less';

// exactly one result per row is allowed
const CELL_RESULT_REGEXP = /^[^0-9]*([0-9]+[-+=?])[^-+?]*$/;
const RESULT_REGEXP = /[0-9]+[-+?]/g;

/**
 * Applies highlighter to all elements matching given selector if they look like Go results.
 *
 * @param {string} selector - CSS-like selector
 * @param {HighlighterSettings} settings - highlighter settings
 * @param {boolean} [force=false] - whether the check for results should be ignored
 */
function applyHighlighter(selector, settings, force) {
    const elementsWithGoResults = asArray(document.querySelectorAll(selector))
        .filter(/** Element */ element => {

            if (force) {
                return true;
            }

            // table element will be treated as results if any of its cells contain SINGLE result
            // string.
            if (element.nodeName === 'TABLE') {
                const rowsCount = element.rows.length;

                for (let i = 0; i < rowsCount; i++) {
                    const cellsCount = element.rows[i].cells.length;

                    for (let j = 0; j < cellsCount; j++) {
                        if (CELL_RESULT_REGEXP.test(element.rows[i].cells[j].textContent)) {
                            return true;
                        }
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
            applyHighlighter(newSelector, settings, true);
        } else {
            console.log('Could not find any elements with Go results.');
        }

        return;
    }

    let appliedCount = 0;
    let skippedCount = 0;

    elementsWithGoResults
        .forEach(element => {
            if (element.goResultsHighlighter) {
                skippedCount += 1;
                return;
            }

            const highlighter = new GoResultsHighlighter(element, settings);

            highlighter.clearInlineStyles();
            appliedCount += 1;
        });

    console.log(`Go Results Highlighter was applied to ${appliedCount} DOM elements. ${skippedCount} had Highlighter before.`);
}

if (location.hostname.indexOf('europeangodatabase') !== -1) {
    applyHighlighter('#tab_wallist', { placeColumn: 1 });
} else {
    applyHighlighter('table, pre');
}