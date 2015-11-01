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
    row: 0,
    column: 0,
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
 * @param {object} settings.column
 * @param {object} settings.row
 * @returns {object}
 */
export function mapRowsToPlayers(table, settings) {
    const rows = asArray(table.querySelectorAll(settings.rowTags));
    const resultsMap = mapResultsSettings(settings.results);
    const results = [];

    let lastPlace;

    rows.forEach((row, index) => {
        if (index < settings.row) {
            return;
        }

        const cells = asArray(row.querySelectorAll(settings.cellTags));

        // assign default place
        row.goResultPlace = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.column]) {
            return;
        }

        let place = parseInt(cells[settings.column].textContent, 10);

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

                let opponentPlace = match[1];

                cell.goOpponentPlace = opponentPlace;
                player.games[opponentPlace] = {
                    cell,
                    cls: result.cls
                };
                player.opponents.push(opponentPlace);
            }
        });

        row.goResultPlace = place;
        lastPlace = place;
        results[place] = player;
    });

    return results;
}

export default class GoResultsHighlighter {

    /**
     * Creates new instance of GoResultsHighlighter
     *
     * @param {HTMLElement} element - main element containing table with results
     * @param {object} [settings] - plugin settings
     * @param {number} [settings.column=0] - index of the column
     * where the script should expect to find player's placement
     * @param {number} [settings.row=0] - starting row with players
     * @param {string} [settings.prefixCls='go-results-'] - css class prefix
     * @param {string} [settings.gameCls='game'] - game cell class name
     * @param {string} [settings.currentCls='current'] - selected row class name
     * @param {object} [settings.results] - map with possible results, by default
     * supports 4 options. Provide with "className" -> "regexp" pattern.
     * @param {string} [settings.results.won='([0-9]+)\\+'] - default winning regexp
     * @param {string} [settings.results.lost='([0-9]+)\\-'] - default losing regexp
     * @param {string} [settings.results.jigo='([0-9]+)='] - default draw regexp
     * @param {string} [settings.results.unresolved='([0-9]+)\\?] - default unresolved regexp
     * @param {string} [settings.rowTags='tr'] - querySelection-compatible string
     * with tags representing players' rows
     * @param {string} [settings.cellTags='td,th'] - querySelection-compatible
     * string with tags holding game results
     */
    constructor(element, settings) {
        this.element = element;
        this.settings = defaults(settings, DEFAULT_SETTINGS);
        this.map = mapRowsToPlayers(this.element, this.settings);

        this.bindEvents();
    }

    /**
     * Marks the row for selected player and a cell with opponents game if
     * provided.
     * @param {number} [playerPlace] - player's place, selection will be remove
     * if not player is found for given place
     * @param {number} [opponentPlace] - player's opponent's place - to mark
     * cells with game between player and the opponent
     */
    selectPlayer(playerPlace, opponentPlace) {
        const currentCls = this.settings.prefixCls + this.settings.currentCls;
        const gameCls = this.settings.prefixCls + this.settings.gameCls;

        const player = this.map[playerPlace];

        const markedGames = asArray(this.element.querySelectorAll('.' + gameCls));
        const markedRow = this.element.querySelector('.' + currentCls);
        const markedPlayer = markedRow && markedRow.goResultPlace ? this.map[markedRow.goResultPlace] : null;

        // remove any visible game markings
        for (let gameCell of markedGames) {
            gameCell.classList.remove(gameCls);
        }

        // unmark player if necessary
        if (markedPlayer && markedPlayer !== player) {
            mark.call(this, markedPlayer, false);
        }

        // mark the player if not already marked
        if (player && player !== markedPlayer) {
            mark.call(this, player, true);
        }

        // mark the game between the player and the opponent
        if (player && opponentPlace) {
            player.games[opponentPlace].cell.classList.add(gameCls);
            this.map[opponentPlace].games[playerPlace].cell.classList.add(gameCls);
        }

        function mark(player, active) {
            const method = active ? 'add' : 'remove';

            player.row.classList[method](currentCls);

            for (let opponentPlace of player.opponents) {
                let opponent = this.map[opponentPlace];

                opponent.row.classList[method](this.settings.prefixCls + player.games[opponentPlace].cls);
            }
        }
    }

    /**
     * Binds mouseover and mouseout events listeners to the element.
     */
    bindEvents() {
        this.element.addEventListener('mouseover', (event) => {
            let target = event.target;
            let opponent = null;
            let player = null;

            // fetch information about hovered element
            while (target && target !== document) {

                // game cell?
                if (target.goOpponentPlace) {
                    opponent = target.goOpponentPlace;
                }

                // player row? no further search is necessary
                if (target.goResultPlace) {
                    player = target.goResultPlace;
                    break;
                }

                target = target.parentNode;
            }

            if (!player) {
                return;
            }

            this.selectPlayer(player, opponent);
        }, false);

        this.element.addEventListener('mouseout', (event) => {
            let target = event.relatedTarget;

            while (target && target !== document && target !== this.element) {
                target = target.parentNode;
            }

            // if new hovered element is outside the table then remove all
            // selections
            if (target !== this.element) {
                this.selectPlayer(-1)
            }
        }, false);
    }
}

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;