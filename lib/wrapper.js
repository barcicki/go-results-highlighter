'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _highlighter = require('./highlighter');

var _highlighter2 = _interopRequireDefault(_highlighter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Class wrapper for highlighter
 * @module wrapper
 */

/**
 * Creates new Go Results Highlighter
 * @param {HTMLElement} element - element where the highlighter should be bound
 * to, preferably a table or a pre element
 * @param {HighlighterSettings} [settings] - configuration of the highlighter
 * @constructor
 */
function GoResultsHighlighter(element, settings) {

    // force new instance
    if (!(this instanceof GoResultsHighlighter)) {
        return new GoResultsHighlighter(element, settings);
    }

    var highlighter = new _highlighter2.default(element, settings);

    /**
     * Highlights player and his/hers opponents
     * @param {number|object} player - placement of the player or the object with
     * properties containing player, rearrange and opponent fields
     * @param {number|Array.<number>|boolean} [games] - opponent with whom the game should be
     * @param {boolean} [rearrange] - whether to rearrange result rows
     * highlighted
     */
    this.highlight = function (player, games, rearrange) {
        if ((typeof player === 'undefined' ? 'undefined' : _typeof(player)) === 'object') {
            highlighter.highlight(player);
        } else {

            if (typeof games === 'boolean') {
                rearrange = games;
                games = null;
            }

            highlighter.highlight({ player: player, rearrange: rearrange, games: games });
        }
    };

    /**
     * Changes current configuration of the highlighter
     * @param {HighlighterSettings} settings
     */
    this.configure = function (settings) {
        highlighter.configure(settings);
    };

    /**
     * Gets opponents for the player on provided place.
     * @param {number} player - placement of player to get the list of opponents
     * @returns {Array.<number>}
     */
    this.opponents = function (player) {
        var entry = highlighter.map[player];

        return entry ? entry.opponents.slice() : [];
    };

    Object.defineProperties(this, /** @lends module:wrapper~GoResultsHighlighter.prototype */{

        /**
         * Contains reference to element with highlighter
         * @type {HTMLElement}
         * @readonly
         */
        element: getter(function () {
            return highlighter.element;
        }),

        /**
         * Informs whether the any player is highlighted
         * @type {boolean}
         * @readonly
         */
        isHighlighting: getter(function () {
            return highlighter.isHighlighting;
        }),

        /**
         * Informs whether the rows are rearranged to display results in compact
         * mode
         * @type {boolean}
         * @readonly
         */
        isRearranged: getter(function () {
            return highlighter.isRearranged;
        }),

        /**
         * Contains placement of current highlighted player
         * @type {number|null}
         * @readonly
         */
        player: getter(function () {
            return highlighter.current || null;
        }),

        /**
         * Contains count of player rows
         * @type {number}
         * @readonly
         */
        players: getter(function () {
            return highlighter.players.length;
        }),

        /**
         * Contains list of highlighted games (placements of opponents)
         * @type {Array.<number>}
         * @readonly
         */
        games: getter(function () {
            return highlighter.games;
        }),

        /**
         * Contains current configuration of Go Results Highlighter
         * @type {HighlighterSettings}
         * @readonly
         */
        configuration: getter(function () {
            var originalResults = highlighter.settings.results;
            var results = {};

            for (var prop in originalResults) {
                if (originalResults.hasOwnProperty(prop)) {
                    results[prop] = originalResults[prop];
                }
            }

            return {
                startingRow: highlighter.settings.startingRow,
                placeColumn: highlighter.settings.placeColumn,
                roundsColumns: highlighter.settings.roundsColumns,
                prefixCls: highlighter.settings.prefixCls,
                rearrangedCls: highlighter.settings.rearrangedCls,
                tableCls: highlighter.settings.tableCls,
                gameCls: highlighter.settings.gameCls,
                currentCls: highlighter.settings.currentCls,
                rowTags: highlighter.settings.rowTags,
                cellTags: highlighter.settings.cellTags,
                cellSeparator: highlighter.settings.cellSeparator,
                joinNames: highlighter.settings.joinNames,
                results: results
            };
        }),

        /**
         * Informs whether the rearranging is enabled.
         * @type {boolean}
         */
        rearranging: {
            set: function set(value) {
                if (!value && highlighter.isRearranged) {
                    highlighter.highlight(null);
                }

                highlighter.settings.rearranging = !!value;
            },
            get: function get() {
                return highlighter.settings.rearranging;
            },
            configurable: false,
            enumerable: true
        },

        /**
         * Informs whether the hovering is enabled.
         * @type {boolean}
         */
        hovering: {
            set: function set(value) {
                return highlighter.settings.hovering = !!value;
            },
            get: function get() {
                return highlighter.settings.hovering;
            },
            configurable: false,
            enumerable: true
        }
    });

    highlighter.element.goResultsHighlighter = this;
}

/**
 * Helper function returning definition of read only getter defined in callback
 * @param {Function} callback
 * @returns {object}
 */
function getter(callback) {
    return {
        get: callback,
        enumerable: true,
        configurable: false
    };
}

exports.default = GoResultsHighlighter;