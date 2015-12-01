'use strict';

import Highlighter from './highlighter';

/**
 * Class wrapper for highlighter
 * @module wrapper
 */

/**
 * Creates new Go Results Highlighter
 * @param {HTMLElement} element - element where the highlighter should be bound
 * to, preferably a table or a pre element
 * @param {object} [settings] - configuration of the highlighter
 * @constructor
 */
function GoResultsHighlighter(element, settings) {

    // force new instance
    if (!this instanceof GoResultsHighlighter) {
        return new GoResultsHighlighter(element, settings);
    }

    const highlighter = new Highlighter(element, settings);

    /**
     * Highlights player and his/hers opponents
     * @param {number|object} player - placement of the player or the object with
     * properties containing player, rearrange and opponent fields
     * @param {boolean} [rearrange] - whether to rearrange result rows
     * @param {number} [opponent] - opponent with whom the game should be
     * highlighted
     */
    this.highlight = (player, rearrange, opponent) => {
        if (typeof player === 'object') {
            highlighter.highlight(player);
        } else {
            highlighter.highlight({ player, rearrange, opponent });
        }
    };

    /**
     * Changes current configuration of the highlighter
     * @param {object} settings
     */
    this.configure = (settings) => {
        highlighter.configure(settings);
    };

    /**
     * Gets opponents for the player on provided place.
     * @param {number} player - placement of player to get the list of opponents
     * @returns {Array.<number>}
     */
    this.opponents = (player) => {
        const entry = highlighter.map[player];

        return entry ? entry.opponents.slice() : [];
    };

    Object.defineProperties(this, /** @lends module:wrapper~GoResultsHighlighter.prototype */ {

        /**
         * Contains reference to element with highlighter
         * @type {HTMLElement}
         * @readonly
         */
        element: getter(() => highlighter.element),

        /**
         * Informs whether the any player is highlighted
         * @type {boolean}
         * @readonly
         */
        isHighlighting: getter(() => highlighter.isHighlighting),

        /**
         * Informs whether the rows are rearranged to display results in compact
         * mode
         * @type {boolean}
         * @readonly
         */
        isRearranged: getter(() => highlighter.isRearranged),

        /**
         * Contains placement of current highlighted player
         * @type {number|null}
         * @readonly
         */
        player: getter(() => highlighter.player || null),

        /**
         * Contains count of player rows
         * @type {number}
         * @readonly
         */
        players: getter(() => highlighter.players.length),

        /**
         * Contains current configuration of Go Results Highlighter
         * @type {object}
         * @readonly
         */
        configuration: getter(() => {
            const originalResults = highlighter.settings.results;
            const results = {};

            for (let prop in originalResults) {
                if (originalResults.hasOwnProperty(prop)) {
                    results[prop] = originalResults[prop];
                }
            }

            return {
                startingRow: highlighter.settings.startingRow,
                placeColumn: highlighter.settings.placeColumn,
                roundsColumns: highlighter.settings.roundsColumns,
                prefixCls: highlighter.settings.prefixCls,
                tableCls: highlighter.settings.tableCls,
                gameCls: highlighter.settings.gameCls,
                results
            };
        }),

        /**
         * Informs whether the rearranging is enabled.
         * @type {boolean}
         */
        rearranging: {
            set: (value) => {
                if (!value && highlighter.isRearranged) {
                    highlighter.highlight(null);
                }

                highlighter.settings.rearranging = value;
            },
            get: () => highlighter.settings.rearranging,
            configurable: false,
            enumerable: true,
            writable: false
        },

        /**
         * Informs whether the hovering is enabled.
         * @type {boolean}
         */
        hovering: {
            set: (value) => highlighter.settings.hovering = value,
            get: () => highlighter.settings.rearranging,
            configurable: false,
            enumerable: true,
            writable: false
        }
    });
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
        configurable: false,
        writable: false
    };
}

export default GoResultsHighlighter;