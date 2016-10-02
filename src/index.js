'use strict';

import GoResultsHighlighter from './lib/wrapper';
import {DOM_ATTRIBUTES} from './lib/settings';
import {asArray} from './lib/utils';

/**
 * Registers goResultsHighlighter plugin in jQuery
 */
function registerJQueryPlugin() {
    jQuery.fn.goResultsHighlighter = function jQueryHighlighterWrapper(options) {
        this.each((index, element) => {
            const highlighter = new GoResultsHighlighter(element, options);

            $(highlighter.element).data('GoResultsHighlighter', highlighter);
        });
        return this;
    };
}

/**
 * Runs the highlighter on existing tables
 */
function initialize() {
    const elementsWithResults = document.querySelectorAll(`[${DOM_ATTRIBUTES.RESULT_TABLE}]`);

    if (typeof jQuery !== 'undefined') {

        if (!jQuery.fn.goResultsHighlighter) {
            registerJQueryPlugin();
        }

        jQuery(elementsWithResults).goResultsHighlighter();

    } else {
        asArray(elementsWithResults)
            .forEach(tableEl => new GoResultsHighlighter(tableEl));
    }
}

// if the website is already fully loaded proceed with initialisation
if (document.readyState === 'complete') {
    initialize();

// otherwise ...
} else {

    // check for jQuery and register the plugin at first to make sure that it will be available
    // before any $(document).ready calls
    if (typeof jQuery !== 'undefined') {
        registerJQueryPlugin();
    }

    document.addEventListener('DOMContentLoaded', initialize, false);
}

export default GoResultsHighlighter;