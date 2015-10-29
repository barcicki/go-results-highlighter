'use strict';

/**
 * Default settings of the plugin
 * @type {object}
 */
const DEFAULT_SETTINGS = {
    prefixCls: 'go-results-',
    gameCls: 'game',
    currentCls: 'current',
    results: {
        won: '([0-9]+)\\+',
        lost: '([0-9]+)\\-',
        jigo: '([0-9]+)=',
        unresolved: '([0-9]+)\\?'
    },
    rowTags: 'tr',
    cellTags: 'td,th'
};

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */
export function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object with at values from defaultObj and obj.
 * @param {object} obj
 * @param {object} defaultObj
 * @returns {object}
 */
export function defaults(obj, defaultObj) {
    if (typeof obj !== 'object') {
        return Object.assign({}, defaultObj);
    }

    return Object.assign({}, defaultObj, obj);
}

/**
 * Transforms map of possible results into array of objects with regexp string
 * converted into RegExp objects.
 * @param {object} results
 * @returns {Array.<{cls: string, regexp: RegExp}>}
 */
function mapResultsSettings(results) {
    const map = [];

    for (let cls in results) {
        if (results.hasOwnProperty(cls)) {
            map.push({
                cls,
                regexp: new RegExp(results[cls])
            })
        }
    }

    return map;
}

/**
 * Traverse provided table and create results map
 * @param {HTMLElement} table - table results container
 * @param {object} settings - settings for parser
 * @param {string} settings.rowTags
 * @param {string} settings.cellTags
 * @param {object} settings.results
 * @returns {object}
 */
function mapRowsToPlayers(table, settings) {
    const rows = asArray(table.querySelectorAll(settings.rowTags));
    const resultsMap = mapResultsSettings(settings.results);
    const results = [];

    let lastPlace;

    rows.forEach((row) => {
        const cells = asArray(row.querySelectorAll(settings.cellTags));

        // no cells? unlikely to be a result row
        if (!cells.length) {
            return;
        }

        let place = parseInt(cells[0].textContent, 10);

        // most probably not a result row
        if (isNaN(place) && !lastPlace) {
            return;
        }

        // assumption: if place is not provided then it's an ex aequo case but
        // we need to set a lower place nonetheless
        if (!place) {
            place = lastPlace ? lastPlace + 1 : 1;

        } else if (place <= lastPlace) {
            place = lastPlace + 1;
        }

        const player = {
            place,
            row,
            games: {},
            opponents: []
        };

        cells.forEach((cell) => {
            for (let result of resultsMap) {
                let match = cell.textContent.match(result.regexp);

                if (!match) {
                    continue;
                }

                let opponent = match[1];

                player.games[opponent] = result.cls;
                player.opponents.push(opponent);
            }
        });

        row.goResultPlace = place;
        lastPlace = place;
        results[place] = player;
    });

    return results;
}

export default class GoResultsHighlighter {

    constructor(element, settings) {
        this.element = element;
        this.settings = defaults(settings, DEFAULT_SETTINGS);
        this.map = mapRowsToPlayers(this.element, this.settings);

        console.log('Instance created.', this.map);
    }

    test() {
        console.log(...['This', 'is', 'a', 'working', 'example']);
    }
}

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;