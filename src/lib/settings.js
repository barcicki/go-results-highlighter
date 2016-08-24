'use strict';

/**
 * Default settings of the plugin
 * @type {HighlighterSettings}
 */
export const DEFAULT_SETTINGS = {

    // css class names
    prefixCls:     'go-results-',
    rearrangedCls: 'rearranged',
    tableCls:      'table',
    gameCls:       'game',
    currentCls:    'current',

    // results map
    results: {
        won: '([0-9]+)\\+',
        lost: '([0-9]+)\\-',
        jigo: '([0-9]+)=',
        unresolved: '([0-9]+)\\?'
    },

    // parser settings
    startingRow: 0,
    placeColumn: 0,
    roundsColumns: null,
    nameColumns: null,
    nameColumnHeaders: [],//['name', 'player', 'gracz', 'imię'],
    nameCellExpression : '(?=^.*[A-Z][a-z]{3,})(?!.*([Kk][yy][uu]|[Dd][Aa][Nn]))',
    rowTags: 'tr',
    cellTags: 'td',
    headerTags: 'th',
    ignoreOutOfBoundsRows: false,
    checkColumnsForResults: true,
    checkColumnsForPlayerNames: true,

    // converter settings
    cellSeparator: '[\t ]+',
    joinNames: true,

    // behavior settings
    hovering:    true,
    rearranging: true
};

const CLASSES_TO_BE_PREFIXED = [
    'rearrangedCls',
    'tableCls',
    'gameCls',
    'currentCls'
];

/**
 * Names of attributes used in this plugin
 * @type {{RESULT_TABLE: string, SETTING_STARTING_ROW: string, SETTING_PLACE_COLUMN: string, SETTING_ROUNDS_COLUMNS: string, SETTING_REARRANGING: string, SETTING_HOVERING: string, PLAYER_PLACEMENT: string, OPPONENT_PLACEMENT: string, OPPONENTS: string, GAME_RESULT: string}}
 */
export const DOM_ATTRIBUTES = {
    RESULT_TABLE:           'data-go-results',
    SETTING_STARTING_ROW:   'data-go-starting-row',
    SETTING_PLACE_COLUMN:   'data-go-place-column',
    SETTING_ROUNDS_COLUMNS: 'data-go-rounds-columns',
    SETTING_REARRANGING:    'data-go-rearranging',
    SETTING_HOVERING:       'data-go-hovering',
    PLAYER_PLACEMENT:       'data-go-place',
    OPPONENT_PLACEMENT:     'data-go-opponent',
    OPPONENT_NAME:          'data-go-name',
    OPPONENTS:              'data-go-opponents',
    GAME_RESULT:            'data-go-result'
};

/**
 * Transforms map of possible results into array of objects with regexp string
 * converted into RegExp objects.
 * @param {ClassToResultMapping} results
 * @returns {Array.<ResultMapping>}
 */
export function toResultsWithRegExp(results) {
    const map = [];

    for (let cls in results) {
        if (results.hasOwnProperty(cls)) {
            map.push({
                cls,
                regexp: new RegExp(results[cls])
            });
        }
    }

    return map;
}

/**
 * Transforms array of possible column with player name headers to RegExp
 * @param {Array.<string>} columnHeaders
 * @returns {Array.<RegExp>}
 */
export function nameHeadersToRegExp(columnHeaders) {
    if (!columnHeaders || columnHeaders.length == 0) {
        return [];
    }

    return columnHeaders.map(header => new RegExp(header, 'i')); 
}

/**
 * Returns object with prefixed classes based on settings
 * @param {object} settings
 * @returns {{}}
 */
export function toPrefixedClasses(settings) {
    let result = {};

    CLASSES_TO_BE_PREFIXED.forEach((cls) => {
        result[cls] = settings.prefixCls + settings[cls];
    });

    return result;
}

/**
 * Checks the element for attributes and returns object with set appropriate
 * values
 * @param {HTMLElement} table
 * @returns {object}
 */
export function readTableSettingsFromDOM(table) {
    const output = {};

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_PLACE_COLUMN)) {
        output.placeColumn = Number(table.getAttribute(DOM_ATTRIBUTES.SETTING_PLACE_COLUMN));
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_STARTING_ROW)) {
        output.startingRow = Number(table.getAttribute(DOM_ATTRIBUTES.SETTING_STARTING_ROW));
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_ROUNDS_COLUMNS)) {
        output.roundsColumns = table.getAttribute(DOM_ATTRIBUTES.SETTING_ROUNDS_COLUMNS);
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_REARRANGING)) {
        output.rearranging = table.getAttribute(DOM_ATTRIBUTES.SETTING_REARRANGING) !== 'false';
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_HOVERING)) {
        output.hovering = table.getAttribute(DOM_ATTRIBUTES.SETTING_HOVERING) !== 'false';
    }

    return output;
}


/**
 * @typedef {object} ClassToResultMapping
 * @property {string} [won='([0-9]+)\\+'] - default winning regexp
 * @property {string} [lost='([0-9]+)\\-'] - default losing regexp
 * @property {string} [jigo='([0-9]+)='] - default draw regexp
 * @property {string} [unresolved='([0-9]+)\\?] - default unresolved regexp
 */

/**
 * @typedef {object} ResultMapping
 * @property {string} cls - CSS class name to be added to row which matches the regexp
 * @property {RegExp} regexp - Regexp for result determination
 */

/**
 * @typedef {object} HighlighterSettings
 * @property {string} [prefixCls='go-results-'] - css class prefix
 * @property {string} [rearrangedCls='rearranged'] - class applied when table is rearranged
 * @property {string} [gameCls='game'] - class applied when to game results
 * @property {string} [currentCls='current'] - selected row class name
 * @property {ClassToResultMapping} [results] - contains regexps used to determine game results mapped to css class that is applied to the cell with given result
 * @property {number} [placeColumn=0] - index of the column where the script should expect to find player's placement
 * @property {number} [startingRow=0] - row in table from which the search of results should start
 * @property {string|null} [roundsColumns=null] - coma-separated list of columns which should contain the results, otherwise all columns are scanned
 * @property {string} [rowTags='tr'] - querySelection-compatible string with tags representing players' rows
 * @property {string} [cellTags='td,th'] - querySelection-compatible
 * @property {boolean} [checkColumnsForResults=true] - whether the highlighter should first try to find columns with Go results before parsing every row
 * @property {boolean} [ignoreOutOfBoundsRows=false] - whether it is allowed to have games with player that are not visible on the list (e.g. when table is paginated)
 * @property {string} [cellSeparator='[\t ]+'] - regexp used to split single line into columns when parsing unformatted results
 * @property {boolean} [joinNames=true] - whether 2 columns next to placement should be treated as name and surname and merged into single column when parsing unformatted results
 * @property {boolean} [hovering=true] - whether hovering should be enabled
 * @property {boolean} [rearranging=true] - whether row rearrangement on click should be enabled
 */
