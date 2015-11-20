!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.GoResultsHighlighter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _highlighter = _dereq_('./lib/highlighter');

var _highlighter2 = _interopRequireDefault(_highlighter);

var _settings = _dereq_('./lib/settings');

var _utils = _dereq_('./lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initialize() {
    (0, _utils.asArray)(document.querySelectorAll('[' + _settings.DOM_ATTRIBUTES.RESULT_TABLE + ']')).forEach(function (tableEl) {
        return new _highlighter2.default(tableEl);
    });
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

if (typeof jQuery !== 'undefined') {
    jQuery.fn.goResultsHighlighter = function (options) {
        this.each(function (index, element) {
            var highlighter = new _highlighter2.default(element, options);

            $(highlighter.element).data('GoResultsHighlighter', highlighter);
        });
        return this;
    };
}

exports.default = _highlighter2.default;

},{"./lib/highlighter":2,"./lib/settings":5,"./lib/utils":6}],2:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _settings = _dereq_('./settings');

var _parser = _dereq_('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _raw2table = _dereq_('./raw2table');

var _raw2table2 = _interopRequireDefault(_raw2table);

var _utils = _dereq_('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GoResultsHighlighter = (function () {

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

    function GoResultsHighlighter(element, settings) {
        _classCallCheck(this, GoResultsHighlighter);

        this.settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, (0, _settings.readTableSettingsFromDOM)(element), settings);

        if (element instanceof HTMLPreElement) {
            var table = (0, _raw2table2.default)(element.innerHTML, settings);
            var parent = element.parentNode;

            parent.insertBefore(table, element);
            parent.removeChild(element);

            this.element = table;
        } else {
            this.element = element;
        }

        if (!this.element.classList) {
            // not supported
            return;
        }

        this.createPlayersMap();
        this.bindEvents();

        this.element.classList.add(this.settings.prefixCls + this.settings.tableCls);
        this.element.goResultsHighlighter = this;
        this.isShowingDetails = false;
    }

    /**
     * Creates players map
     */

    _createClass(GoResultsHighlighter, [{
        key: 'createPlayersMap',
        value: function createPlayersMap() {
            this.map = (0, _parser2.default)(this.element, this.settings);
            this.players = [];

            for (var placement in this.map) {
                if (this.map.hasOwnProperty(placement)) {
                    this.players.push(this.map[placement]);
                }
            }
        }

        /**
         * Marks player and his opponents highlighted.
         * @param {object|number|null} [settings] - highlighting settings or player to be highlighted
         * @param {number} [settings.player] - player whose opponents should be
         * highlighted
         * @param {boolean} [settings.compact=false] - whether the table should be
         * rearranged to display results in compact size
         * @param {number} [settings.opponent] - the opponent whose game with the
         * player should be highlighted
         * @param {boolean} [compact=false] - if settings are not provided than this
         * argument is checked for compact flag
         */

    }, {
        key: 'highlight',
        value: function highlight(settings) {
            var _this = this;

            var compact = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var playerPlace = undefined;
            var gameWithOpponent = undefined;

            if (settings && (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) === 'object') {
                playerPlace = settings.player;
                compact = settings.compact === true;
                gameWithOpponent = settings.opponent;
            } else {
                playerPlace = settings;
            }

            var player = this.map[playerPlace];
            var classes = (0, _settings.toPrefixedClasses)(this.settings);

            // if table is already rearranged then transform it back to default state
            if (this.isShowingDetails) {
                restoreNaturalOrder(this.players);
            }

            // rearrange the table if player and appropriate setting is provided
            if (player && compact) {
                rearrangeOrder(player, player.opponents.map(function (opponentPlace) {
                    return _this.map[opponentPlace];
                }));

                this.element.classList.add(classes.showingDetailsCls);
                this.isShowingDetails = true;
            } else {
                this.element.classList.remove(classes.showingDetailsCls);
                this.isShowingDetails = false;
            }

            var markedGames = (0, _utils.asArray)(this.element.querySelectorAll('.' + classes.gameCls));
            var markedRow = this.element.querySelector('.' + classes.currentCls);
            var markedRowPlacement = markedRow ? markedRow.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT) : null;
            var markedPlayer = markedRowPlacement ? this.map[markedRowPlacement] : null;
            var mark = function mark(player, active) {
                var method = active ? 'add' : 'remove';

                player.row.classList[method](classes.currentCls);

                player.opponents.forEach(function (opponentPlace) {
                    var opponent = _this.map[opponentPlace];

                    opponent.row.classList[method](_this.settings.prefixCls + player.games[opponentPlace].cls);
                });
            };

            // remove any visible game markings
            markedGames.forEach(function (gameCell) {
                gameCell.classList.remove(classes.gameCls);
            });

            // unmark player if necessary
            if (markedPlayer && markedPlayer !== player) {
                mark(markedPlayer, false);
            }

            // mark the player if not already marked
            if (player && player !== markedPlayer) {
                mark(player, true);
            }

            if (player) {
                if (gameWithOpponent && this.map[gameWithOpponent]) {
                    var game = player.games[gameWithOpponent];
                    var opponent = this.map[gameWithOpponent];

                    if (game && opponent) {
                        game.cell.classList.add(classes.gameCls);
                        opponent.games[playerPlace].cell.classList.add(classes.gameCls);
                    }
                } else if (this.isShowingDetails) {
                    player.opponents.forEach(function (opponent) {
                        _this.map[opponent].games[playerPlace].cell.classList.add(classes.gameCls);
                    });
                }
            }
        }

        /**
         * Binds mouseover and mouseout events listeners to the element.
         */

    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this2 = this;

            this.element.addEventListener('click', function (event) {
                if (_this2.settings.clicking === false) {
                    return;
                }

                var target = event.target;
                var playerPlacement = null;

                // fetch information about hovered element
                while (target && target !== document) {
                    var placement = target.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT);

                    // player row? no further search is necessary
                    if (placement) {
                        playerPlacement = Number(placement);
                        break;
                    }

                    target = target.parentNode;
                }

                if (!playerPlacement) {
                    return;
                }

                var lastTargetPos = undefined;

                if (!_this2.isShowingDetails) {
                    _this2.highlight(playerPlacement, true);
                } else if (target.properNextSibling) {
                    lastTargetPos = target.getBoundingClientRect().top;

                    _this2.highlight(playerPlacement, true);
                } else {
                    lastTargetPos = target.getBoundingClientRect().top;

                    if (_this2.settings.hovering) {
                        _this2.highlight(playerPlacement);
                    } else {
                        _this2.highlight(-1);
                    }
                }

                if (lastTargetPos) {
                    var diff = target.getBoundingClientRect().top - lastTargetPos;

                    if (Math.abs(diff) > 10) {
                        window.scrollBy(0, diff);
                    }
                }
            });

            this.element.addEventListener('mouseover', function (event) {
                if (_this2.settings.hovering === false || _this2.isShowingDetails) {
                    return;
                }

                var target = event.target;
                var opponent = null;
                var player = null;

                // fetch information about hovered element
                while (target && target !== document) {
                    var opponentGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT);
                    var playerGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT);

                    // game cell?
                    if (opponentGridPlacement) {
                        opponent = Number(opponentGridPlacement);
                    }

                    // player row? no further search is necessary
                    if (playerGridPlacement) {
                        player = Number(playerGridPlacement);
                        break;
                    }

                    target = target.parentNode;
                }

                if (!player) {
                    return;
                }

                _this2.highlight({ player: player, opponent: opponent });
            }, false);

            this.element.addEventListener('mouseout', function (event) {
                if (_this2.settings.hovering === false || _this2.isShowingDetails) {
                    return;
                }

                var target = event.relatedTarget;

                while (target && target !== document && target !== _this2.element) {
                    target = target.parentNode;
                }

                // if new hovered element is outside the table then remove all
                // selections
                if (target !== _this2.element) {
                    _this2.highlight(-1);
                }
            }, false);
        }
    }]);

    return GoResultsHighlighter;
})();

/**
 * Restores default order of rows in the table
 * @param {Array.<object>} players - list of mapping data for all rows
 */

exports.default = GoResultsHighlighter;
function restoreNaturalOrder(players) {
    players.filter(function (player) {
        return player.row.properNextSibling;
    }).reverse().forEach(function (player) {
        if (player.row.properNextSibling === -1) {
            player.row.parentNode.appendChild(player.row);
        } else {
            player.row.parentNode.insertBefore(player.row, player.row.properNextSibling);
        }
        player.row.properNextSibling = null;
    });
}

/**
 * Rearranges the rows in a table
 * @param {object} player - player mapping data
 * @param {Array.<object>} opponents - list of opponents mapping data
 */
function rearrangeOrder(player, opponents) {
    var parent = player.row.parentNode;
    var after = player.row.nextElementSibling;

    opponents.forEach(function (opponent) {
        opponent.row.properNextSibling = opponent.row.nextElementSibling || -1;

        if (opponent.tournamentPlace < player.tournamentPlace) {
            parent.insertBefore(opponent.row, player.row);
        } else {
            parent.insertBefore(opponent.row, after);
            after = opponent.row.nextElementSibling;
        }
    });
}

GoResultsHighlighter.DEFAULT_SETTINGS = _settings.DEFAULT_SETTINGS;

},{"./parser":3,"./raw2table":4,"./settings":5,"./utils":6}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parse;

var _utils = _dereq_('./utils');

var _settings = _dereq_('./settings');

function writeGridPlacement(row, placement) {
    row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
}

/**
 * Traverse provided table and create results map
 * @param {HTMLElement} table - table results container
 * @param {object} [config] - settings for parser
 * @param {string} [config.rowTags]
 * @param {string} [config.cellTags]
 * @param {object} [config.results]
 * @param {object} [config.placeColumn]
 * @param {object} [config.roundsColumns]
 * @param {object} [config.startingRow]
 * @returns {object}
 */
function parse(table, config) {
    var settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, config);
    var rows = (0, _utils.asArray)(table.querySelectorAll(settings.rowTags));
    var resultsMap = (0, _settings.toResultsWithRegExp)(settings.results);
    var resultsMapCount = resultsMap.length;
    var results = {};

    function parseGames(player, cells) {
        // if columns rounds are provided then parse only them
        if (typeof settings.roundsColumns === 'string') {
            cells = settings.roundsColumns.split(',').map(function (round) {
                return cells[Number(round)];
            });
        }

        cells.forEach(function (cell) {
            var opponentPlace = undefined;
            var resultCls = undefined;

            if (cell.hasAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT) && cell.hasAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT)) {
                opponentPlace = Number(cell.getAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT));
                resultCls = cell.getAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT);
            } else {
                for (var i = 0; i < resultsMapCount; i++) {
                    var match = cell.textContent.match(resultsMap[i].regexp);

                    if (!match) {
                        continue;
                    }

                    opponentPlace = Number(match[1]);
                    resultCls = resultsMap[i].cls;

                    cell.setAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT, opponentPlace);
                    cell.setAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT, resultsMap[i].cls);
                }

                if (!opponentPlace) {
                    return;
                }
            }

            player.games[opponentPlace] = {
                cell: cell,
                cls: resultCls
            };

            player.opponents.push(opponentPlace);
        });
    }

    var lastTournamentPlacement = undefined;
    var lastGridPlacement = undefined;

    rows.forEach(function (row, index) {
        if (index < settings.startingRow) {
            return;
        }

        var cells = (0, _utils.asArray)(row.querySelectorAll(settings.cellTags));

        // assign default place
        var gridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.placeColumn]) {
            writeGridPlacement(row, gridPlacement);
            return;
        }

        var tournamentPlacement = parseInt(cells[settings.placeColumn].textContent, 10);

        var player = {
            tournamentPlace: -1,
            row: row,
            games: {},
            opponents: []
        };

        if (row.hasAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT)) {
            gridPlacement = Number(row.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT));
        } else {

            // if no player has been mapped
            if (!lastGridPlacement) {

                // most probably not a result row
                if (isNaN(tournamentPlacement)) {
                    writeGridPlacement(row, gridPlacement);
                    return;
                }

                // assign tournament if defined (possibly showing an extract from greater table)
                gridPlacement = tournamentPlacement || 1;
            } else {
                gridPlacement = lastGridPlacement + 1;
            }

            // assumption: if place is not provided then it's an ex aequo case but
            // we need to set a lower place nonetheless
            if (!tournamentPlacement) {
                tournamentPlacement = lastTournamentPlacement ? lastTournamentPlacement : 1;
            } else if (tournamentPlacement <= lastTournamentPlacement) {
                tournamentPlacement = lastTournamentPlacement;
            }

            writeGridPlacement(row, gridPlacement);
        }

        if (gridPlacement == -1) {
            return;
        }

        parseGames(player, cells);

        player.tournamentPlace = tournamentPlacement;
        player.opponents.sort(function (a, b) {
            return a > b ? 1 : -1;
        });

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    return results;
}

},{"./settings":5,"./utils":6}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = convertRawResultsToTable;

var _settings = _dereq_('./settings');

var _utils = _dereq_('./utils');

/**
 * Converts raw results string into table with rows and cells.
 * Returns null if not valid input.
 * @param {string} rawResults
 * @param {object} [config]
 * @param {number} [config.startingRow=0] - informs where is the first row with results
 * @param {number} [config.placeColumn=0] - informs in which column is the place located
 * @param {string} [config.roundsColumns] - comma separated list of columns where game results are located
 * @param {string} [config.cellSeparator='[\t ]+'] - separated used to divide rows into cells
 * @param {boolean} [config.joinNames=true] - joins two consecutive cells after the place column into one cell
 * @returns {HTMLElement|null}
 */
function convertRawResultsToTable(rawResults, config) {
    var output = document.createElement('table');

    if (!rawResults) {
        return output;
    }

    var settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, config);
    var lines = rawResults.split(/\r\n|\n/);

    if (lines.length <= 2 && !lines[0] && !lines[1]) {
        return output;
    }

    var resultsMap = (0, _settings.toResultsWithRegExp)(settings.results);
    var resultsMapCount = resultsMap.length;

    var rows = lines.map(function (line) {
        return line

        // probably unhealthy replacing space in rank in order to make sure
        // that it won't be broken into two cells
        .replace(/([0-9]+)\s(dan|kyu)/i, '$1_$2')

        // split line to cells (consider tabs and spaces as separators by default)
        .split(new RegExp(settings.cellSeparator))

        // remove empty cells
        .filter(function (cell) {
            return cell.length > 0;
        });
    })

    // filter out empty rows or rows starting with ';' (EGD/FFG comment)
    .filter(function (cells) {
        return cells.length > 0 && cells[0].indexOf(';') !== 0;
    });

    var tableWidth = rows.reduce(function (prev, line) {
        return Math.max(prev, line.length);
    }, 0);
    var tableModifier = settings.joinNames ? -1 : 0;
    var joinNamePos = settings.placeColumn + 1;

    var gamesInColumns = null;

    // if columns rounds are provided then convert only them
    if (typeof settings.roundsColumns === 'string') {
        gamesInColumns = settings.roundsColumns.split(',').map(Number);
    }

    var previousPlace = undefined;

    rows.forEach(function (cells, index) {
        var row = document.createElement('tr');
        var width = cells.length;

        if (!width) {
            return;
        }

        if (index < settings.startingRow || width < tableWidth + tableModifier) {
            var cell = document.createElement('td');

            cell.setAttribute('colspan', tableWidth + tableModifier);
            cell.textContent = cells.join(' ');

            row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, -1);
            row.appendChild(cell);
        } else {

            var place = parseInt(cells[settings.placeColumn], 10);

            if (isNaN(place) && !previousPlace) {
                cells.forEach(function (cellContent) {
                    var cell = document.createElement('td');

                    cell.textContent = cellContent;

                    row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, -1);
                    row.appendChild(cell);
                });
            } else {
                (function () {
                    row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, previousPlace || place);

                    var opponents = [];

                    if (settings.joinNames) {
                        cells.splice(joinNamePos, 2, cells[joinNamePos] + '  ' + cells[joinNamePos + 1]);
                    }

                    cells.forEach(function (cellContent, index) {
                        var cell = document.createElement('td');

                        cell.textContent = cellContent.replace(/_/, ' ');

                        if (!gamesInColumns || gamesInColumns.indexOf(index) >= 0) {
                            for (var i = 0; i < resultsMapCount; i++) {
                                var match = cellContent.match(resultsMap[i].regexp);

                                if (!match) {
                                    continue;
                                }

                                var opponentPlacement = match[1];

                                opponents.push(opponentPlacement);
                                cell.setAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT, opponentPlacement);
                                cell.setAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT, resultsMap[i].cls);
                            }
                        }

                        row.appendChild(cell);
                    });

                    if (opponents.length) {
                        row.setAttribute(_settings.DOM_ATTRIBUTES.OPPONENTS, opponents.join(','));
                    }

                    if (!previousPlace) {
                        previousPlace = 2;
                    } else {
                        previousPlace += 1;
                    }
                })();
            }
        }

        output.appendChild(row);
    });

    output.setAttribute(_settings.DOM_ATTRIBUTES.RESULT_TABLE, '');

    return output;
}

},{"./settings":5,"./utils":6}],5:[function(_dereq_,module,exports){
'use strict'

/**
 * Default settings of the plugin
 * @type {{prefixCls: string, showingDetailsCls: string, tableCls: string, gameCls: string, currentCls: string, results: {won: string, lost: string, jigo: string, unresolved: string}, startingRow: number, placeColumn: number, roundsColumns: null, rowTags: string, cellTags: string, rowSeparator: string, hovering: boolean, clicking: boolean}}
 */
;
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toResultsWithRegExp = toResultsWithRegExp;
exports.toPrefixedClasses = toPrefixedClasses;
exports.readTableSettingsFromDOM = readTableSettingsFromDOM;
var DEFAULT_SETTINGS = exports.DEFAULT_SETTINGS = {
    prefixCls: 'go-results-',
    showingDetailsCls: 'showing-details',
    tableCls: 'table',
    gameCls: 'game',
    currentCls: 'current',

    results: {
        won: '([0-9]+)\\+',
        lost: '([0-9]+)\\-',
        jigo: '([0-9]+)=',
        unresolved: '([0-9]+)\\?'
    },

    startingRow: 0,
    placeColumn: 0,
    roundsColumns: null,

    rowTags: 'tr',
    cellTags: 'td,th',
    cellSeparator: '[\t ]+',
    joinNames: true,

    hovering: true,
    clicking: true
};

var CLASSES_TO_BE_PREFIXED = ['showingDetailsCls', 'tableCls', 'gameCls', 'currentCls'];

/**
 * Names of attributes used in this plugin
 * @type {{RESULT_TABLE: string, SETTING_STARTING_ROW: string, SETTING_PLACE_COLUMN: string, SETTING_ROUNDS_COLUMNS: string, PLAYER_PLACEMENT: string, OPPONENT_PLACEMENT: string, GAME_RESULT: string}}
 */
var DOM_ATTRIBUTES = exports.DOM_ATTRIBUTES = {
    RESULT_TABLE: 'data-go-results',
    SETTING_STARTING_ROW: 'data-go-starting-row',
    SETTING_PLACE_COLUMN: 'data-go-place-col',
    SETTING_ROUNDS_COLUMNS: 'data-go-rounds-cols',
    SETTING_CLICKING: 'data-go-clicking',
    SETTING_HOVERING: 'data-go-hovering',
    PLAYER_PLACEMENT: 'data-go-place',
    OPPONENT_PLACEMENT: 'data-go-opponent',
    OPPONENTS: 'data-go-opponents',
    GAME_RESULT: 'data-go-result'
};

/**
 * Transforms map of possible results into array of objects with regexp string
 * converted into RegExp objects.
 * @param {object} results
 * @returns {Array.<{cls: string, regexp: RegExp}>}
 */
function toResultsWithRegExp(results) {
    var map = [];

    for (var cls in results) {
        if (results.hasOwnProperty(cls)) {
            map.push({
                cls: cls,
                regexp: new RegExp(results[cls])
            });
        }
    }

    return map;
}

/**
 * Returns object with prefixed classes based on settings
 * @param {object} settings
 * @returns {{}}
 */
function toPrefixedClasses(settings) {
    var result = {};

    CLASSES_TO_BE_PREFIXED.forEach(function (cls) {
        result[cls] = settings.prefixCls + settings[cls];
    });

    return result;
}

/**
 * Checks the element for 3 attributes and returns object with set appropriate
 * values
 * @param {HTMLElement} table
 * @returns {object}
 */
function readTableSettingsFromDOM(table) {
    var output = {};

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_PLACE_COLUMN)) {
        output.placeColumn = Number(table.getAttribute(DOM_ATTRIBUTES.SETTING_PLACE_COLUMN));
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_STARTING_ROW)) {
        output.startingRow = Number(table.getAttribute(DOM_ATTRIBUTES.SETTING_STARTING_ROW));
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_ROUNDS_COLUMNS)) {
        output.roundsColumns = table.getAttribute(DOM_ATTRIBUTES.SETTING_ROUNDS_COLUMNS);
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_CLICKING)) {
        output.clicking = table.getAttribute(DOM_ATTRIBUTES.SETTING_CLICKING) !== 'false';
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_HOVERING)) {
        output.hovering = table.getAttribute(DOM_ATTRIBUTES.SETTING_HOVERING) !== 'false';
    }

    return output;
}

},{}],6:[function(_dereq_,module,exports){
'use strict'

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */
;
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.asArray = asArray;
exports.defaults = defaults;
exports.combine = combine;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object containing keys only from defaultObj but values are taken
 * from if exist (starting from the last object provided)
 * @param {object} defaultObj
 * @param {Array.<object>} ...objects
 * @returns {object}
 */
function defaults(defaultObj) {
    for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objects[_key - 1] = arguments[_key];
    }

    var overrides = objects.filter(function (obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
    }).reverse();

    var count = overrides.length;
    var result = {};

    mainLoop: for (var key in defaultObj) {
        for (var i = 0; i < count; i++) {
            if (overrides[i].hasOwnProperty(key)) {
                result[key] = overrides[i][key];
                continue mainLoop;
            }
        }

        result[key] = defaultObj[key];
    }

    return result;
}

/**
 * Returns new object that has merged properties from all provided objects.
 * Latest arguments overrides the earlier values.
 * @param {Array.<object>} objects
 * @returns {object}
 */
function combine() {
    var result = {};

    for (var _len2 = arguments.length, objects = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        objects[_key2] = arguments[_key2];
    }

    objects.forEach(function (object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                result[key] = object[key];
            }
        }
    });

    return result;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImZha2VfM2RlNzU2ZS5qcyIsImhpZ2hsaWdodGVyLmpzIiwicGFyc2VyLmpzIiwicmF3MnRhYmxlLmpzIiwic2V0dGluZ3MuanMiLCJ1dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQU1iLFNBQVMsVUFBVSxHQUFHO0FBQ2xCLGVBSEssT0FBTyxFQUdKLFFBQVEsQ0FBQyxnQkFBZ0IsT0FBSyxVQUpqQyxjQUFjLENBSWtDLFlBQVksT0FBSSxDQUFDLENBQ2pFLE9BQU8sQ0FBQyxVQUFDLE9BQU87ZUFBSywwQkFBeUIsT0FBTyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0NBQ2hFOztBQUVELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7QUFDcEMsY0FBVSxFQUFFLENBQUM7Q0FDaEIsTUFBTTtBQUNILFlBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDcEU7O0FBRUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7QUFDL0IsVUFBTSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUNoRCxZQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUNoQyxnQkFBSSxXQUFXLEdBQUcsMEJBQXlCLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFN0QsYUFBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDcEUsQ0FBQyxDQUFDO0FBQ0gsZUFBTyxJQUFJLENBQUM7S0FD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akM7O0FBRUQsV0FBTyxNQUFNLENBQUM7Q0FDakI7Ozs7Ozs7O0FBQUEsQUFRTSxTQUFTLE9BQU8sR0FBYTtBQUNoQyxRQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7O3VDQURLLE9BQU87QUFBUCxlQUFPOzs7QUFHOUIsV0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUN4QixhQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtBQUNwQixnQkFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLHNCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7S0FDSixDQUFDLENBQUM7O0FBRUgsV0FBTyxNQUFNLENBQUM7Q0FDakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IEdvUmVzdWx0c0hpZ2hsaWdodGVyIGZyb20gJy4vbGliL2hpZ2hsaWdodGVyJztcclxuaW1wb3J0IHsgRE9NX0FUVFJJQlVURVMgfSBmcm9tICcuL2xpYi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IGFzQXJyYXkgfSBmcm9tICcuL2xpYi91dGlscyc7XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgYXNBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbJHtET01fQVRUUklCVVRFUy5SRVNVTFRfVEFCTEV9XWApKVxyXG4gICAgICAgIC5mb3JFYWNoKCh0YWJsZUVsKSA9PiBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIodGFibGVFbCkpO1xyXG59XHJcblxyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgaW5pdGlhbGl6ZSgpO1xyXG59IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXRpYWxpemUsIGZhbHNlKTtcclxufVxyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBqUXVlcnkuZm4uZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVyID0gbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgJChoaWdobGlnaHRlci5lbGVtZW50KS5kYXRhKCdHb1Jlc3VsdHNIaWdobGlnaHRlcicsIGhpZ2hsaWdodGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdvUmVzdWx0c0hpZ2hsaWdodGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1ByZWZpeGVkQ2xhc3NlcywgcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCBwYXJzZSBmcm9tICcuL3BhcnNlcic7XHJcbmltcG9ydCBjb252ZXJ0IGZyb20gJy4vcmF3MnRhYmxlJztcclxuaW1wb3J0IHsgYXNBcnJheSwgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvUmVzdWx0c0hpZ2hsaWdodGVyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIEdvUmVzdWx0c0hpZ2hsaWdodGVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIG1haW4gZWxlbWVudCBjb250YWluaW5nIHRhYmxlIHdpdGggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gLSBwbHVnaW4gc2V0dGluZ3NcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3MuY29sdW1uPTBdIC0gaW5kZXggb2YgdGhlIGNvbHVtblxyXG4gICAgICogd2hlcmUgdGhlIHNjcmlwdCBzaG91bGQgZXhwZWN0IHRvIGZpbmQgcGxheWVyJ3MgcGxhY2VtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLnJvdz0wXSAtIHN0YXJ0aW5nIHJvdyB3aXRoIHBsYXllcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucHJlZml4Q2xzPSdnby1yZXN1bHRzLSddIC0gY3NzIGNsYXNzIHByZWZpeFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5nYW1lQ2xzPSdnYW1lJ10gLSBnYW1lIGNlbGwgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jdXJyZW50Q2xzPSdjdXJyZW50J10gLSBzZWxlY3RlZCByb3cgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yZXN1bHRzXSAtIG1hcCB3aXRoIHBvc3NpYmxlIHJlc3VsdHMsIGJ5IGRlZmF1bHRcclxuICAgICAqIHN1cHBvcnRzIDQgb3B0aW9ucy4gUHJvdmlkZSB3aXRoIFwiY2xhc3NOYW1lXCIgLT4gXCJyZWdleHBcIiBwYXR0ZXJuLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLndvbj0nKFswLTldKylcXFxcKyddIC0gZGVmYXVsdCB3aW5uaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmxvc3Q9JyhbMC05XSspXFxcXC0nXSAtIGRlZmF1bHQgbG9zaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmppZ289JyhbMC05XSspPSddIC0gZGVmYXVsdCBkcmF3IHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLnVucmVzb2x2ZWQ9JyhbMC05XSspXFxcXD9dIC0gZGVmYXVsdCB1bnJlc29sdmVkIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yb3dUYWdzPSd0ciddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZSBzdHJpbmdcclxuICAgICAqIHdpdGggdGFncyByZXByZXNlbnRpbmcgcGxheWVycycgcm93c1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jZWxsVGFncz0ndGQsdGgnXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGVcclxuICAgICAqIHN0cmluZyB3aXRoIHRhZ3MgaG9sZGluZyBnYW1lIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgc2V0dGluZ3MpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NKGVsZW1lbnQpLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFByZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHRhYmxlID0gY29udmVydChlbGVtZW50LmlubmVySFRNTCwgc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh0YWJsZSwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRhYmxlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgLy8gbm90IHN1cHBvcnRlZFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXllcnNNYXAoKTtcclxuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnRhYmxlQ2xzKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuaXNTaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBwbGF5ZXJzIG1hcFxyXG4gICAgICovXHJcbiAgICBjcmVhdGVQbGF5ZXJzTWFwKCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gcGFyc2UodGhpcy5lbGVtZW50LCB0aGlzLnNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGxhY2VtZW50IGluIHRoaXMubWFwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShwbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaCh0aGlzLm1hcFtwbGFjZW1lbnRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcmtzIHBsYXllciBhbmQgaGlzIG9wcG9uZW50cyBoaWdobGlnaHRlZC5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fG51bWJlcnxudWxsfSBbc2V0dGluZ3NdIC0gaGlnaGxpZ2h0aW5nIHNldHRpbmdzIG9yIHBsYXllciB0byBiZSBoaWdobGlnaHRlZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5wbGF5ZXJdIC0gcGxheWVyIHdob3NlIG9wcG9uZW50cyBzaG91bGQgYmVcclxuICAgICAqIGhpZ2hsaWdodGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzZXR0aW5ncy5jb21wYWN0PWZhbHNlXSAtIHdoZXRoZXIgdGhlIHRhYmxlIHNob3VsZCBiZVxyXG4gICAgICogcmVhcnJhbmdlZCB0byBkaXNwbGF5IHJlc3VsdHMgaW4gY29tcGFjdCBzaXplXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLm9wcG9uZW50XSAtIHRoZSBvcHBvbmVudCB3aG9zZSBnYW1lIHdpdGggdGhlXHJcbiAgICAgKiBwbGF5ZXIgc2hvdWxkIGJlIGhpZ2hsaWdodGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjb21wYWN0PWZhbHNlXSAtIGlmIHNldHRpbmdzIGFyZSBub3QgcHJvdmlkZWQgdGhhbiB0aGlzXHJcbiAgICAgKiBhcmd1bWVudCBpcyBjaGVja2VkIGZvciBjb21wYWN0IGZsYWdcclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KHNldHRpbmdzLCBjb21wYWN0ID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgcGxheWVyUGxhY2U7XHJcbiAgICAgICAgbGV0IGdhbWVXaXRoT3Bwb25lbnQ7XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5ncyAmJiB0eXBlb2Ygc2V0dGluZ3MgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHBsYXllclBsYWNlID0gc2V0dGluZ3MucGxheWVyO1xyXG4gICAgICAgICAgICBjb21wYWN0ID0gc2V0dGluZ3MuY29tcGFjdCA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZVdpdGhPcHBvbmVudCA9IHNldHRpbmdzLm9wcG9uZW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBsYXllclBsYWNlID0gc2V0dGluZ3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHRvUHJlZml4ZWRDbGFzc2VzKHRoaXMuc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAvLyBpZiB0YWJsZSBpcyBhbHJlYWR5IHJlYXJyYW5nZWQgdGhlbiB0cmFuc2Zvcm0gaXQgYmFjayB0byBkZWZhdWx0IHN0YXRlXHJcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICByZXN0b3JlTmF0dXJhbE9yZGVyKHRoaXMucGxheWVycyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZWFycmFuZ2UgdGhlIHRhYmxlIGlmIHBsYXllciBhbmQgYXBwcm9wcmlhdGUgc2V0dGluZyBpcyBwcm92aWRlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgY29tcGFjdCkge1xyXG4gICAgICAgICAgICByZWFycmFuZ2VPcmRlcihwbGF5ZXIsIHBsYXllci5vcHBvbmVudHMubWFwKChvcHBvbmVudFBsYWNlKSA9PiB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTaG93aW5nRGV0YWlscyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGNsYXNzZXMuZ2FtZUNscykpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvdyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGNsYXNzZXMuY3VycmVudENscyk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93UGxhY2VtZW50ID0gbWFya2VkUm93ID8gbWFya2VkUm93LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUGxheWVyID0gbWFya2VkUm93UGxhY2VtZW50ID8gdGhpcy5tYXBbbWFya2VkUm93UGxhY2VtZW50XSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgbWFyayA9IChwbGF5ZXIsIGFjdGl2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBhY3RpdmUgPyAnYWRkJyA6ICdyZW1vdmUnO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLnJvdy5jbGFzc0xpc3RbbWV0aG9kXShjbGFzc2VzLmN1cnJlbnRDbHMpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudFBsYWNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXTtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudC5yb3cuY2xhc3NMaXN0W21ldGhvZF0odGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2xzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGFueSB2aXNpYmxlIGdhbWUgbWFya2luZ3NcclxuICAgICAgICBtYXJrZWRHYW1lcy5mb3JFYWNoKChnYW1lQ2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBnYW1lQ2VsbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrKG1hcmtlZFBsYXllciwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgcGxheWVyIGlmIG5vdCBhbHJlYWR5IG1hcmtlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgcGxheWVyICE9PSBtYXJrZWRQbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyayhwbGF5ZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICBpZiAoZ2FtZVdpdGhPcHBvbmVudCAmJiB0aGlzLm1hcFtnYW1lV2l0aE9wcG9uZW50XSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdhbWUgPSBwbGF5ZXIuZ2FtZXNbZ2FtZVdpdGhPcHBvbmVudF07XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtnYW1lV2l0aE9wcG9uZW50XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZSAmJiBvcHBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdhbWUuY2VsbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQuZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChjbGFzc2VzLmdhbWVDbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50XS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyUGxhY2VtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBsYWNlbWVudCA9IE51bWJlcihwbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBsYXllclBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodChwbGF5ZXJQbGFjZW1lbnQsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQucHJvcGVyTmV4dFNpYmxpbmcpIHtcclxuICAgICAgICAgICAgICAgIGxhc3RUYXJnZXRQb3MgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHBsYXllclBsYWNlbWVudCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFzdFRhcmdldFBvcyA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaG92ZXJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodChwbGF5ZXJQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodCgtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsYXN0VGFyZ2V0UG9zKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSBsYXN0VGFyZ2V0UG9zO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkaWZmKSA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbEJ5KDAsIGRpZmYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaG92ZXJpbmcgPT09IGZhbHNlIHx8IHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudEdyaWRQbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyR3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2FtZSBjZWxsP1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50R3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50ID0gTnVtYmVyKG9wcG9uZW50R3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcGxheWVyIHJvdz8gbm8gZnVydGhlciBzZWFyY2ggaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyR3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllciA9IE51bWJlcihwbGF5ZXJHcmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoeyBwbGF5ZXIsIG9wcG9uZW50IH0pO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLmlzU2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQgJiYgdGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBuZXcgaG92ZXJlZCBlbGVtZW50IGlzIG91dHNpZGUgdGhlIHRhYmxlIHRoZW4gcmVtb3ZlIGFsbFxyXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVzdG9yZXMgZGVmYXVsdCBvcmRlciBvZiByb3dzIGluIHRoZSB0YWJsZVxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBwbGF5ZXJzIC0gbGlzdCBvZiBtYXBwaW5nIGRhdGEgZm9yIGFsbCByb3dzXHJcbiAqL1xyXG5mdW5jdGlvbiByZXN0b3JlTmF0dXJhbE9yZGVyKHBsYXllcnMpIHtcclxuICAgIHBsYXllcnNcclxuICAgICAgICAuZmlsdGVyKChwbGF5ZXIpID0+IHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpXHJcbiAgICAgICAgLnJldmVyc2UoKVxyXG4gICAgICAgIC5mb3JFYWNoKChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQocGxheWVyLnJvdyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBsYXllci5yb3csIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUmVhcnJhbmdlcyB0aGUgcm93cyBpbiBhIHRhYmxlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbGF5ZXIgLSBwbGF5ZXIgbWFwcGluZyBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9wcG9uZW50cyAtIGxpc3Qgb2Ygb3Bwb25lbnRzIG1hcHBpbmcgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gcmVhcnJhbmdlT3JkZXIocGxheWVyLCBvcHBvbmVudHMpIHtcclxuICAgIGNvbnN0IHBhcmVudCA9IHBsYXllci5yb3cucGFyZW50Tm9kZTtcclxuICAgIGxldCBhZnRlciA9IHBsYXllci5yb3cubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG5cclxuICAgIG9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudCkgPT4ge1xyXG4gICAgICAgIG9wcG9uZW50LnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG9wcG9uZW50LnJvdy5uZXh0RWxlbWVudFNpYmxpbmcgfHwgLTE7XHJcblxyXG4gICAgICAgIGlmIChvcHBvbmVudC50b3VybmFtZW50UGxhY2UgPCBwbGF5ZXIudG91cm5hbWVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUob3Bwb25lbnQucm93LCBwbGF5ZXIucm93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgYWZ0ZXIpO1xyXG4gICAgICAgICAgICBhZnRlciA9IG9wcG9uZW50LnJvdy5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBhc0FycmF5LCBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9SZXN1bHRzV2l0aFJlZ0V4cCB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5cclxuZnVuY3Rpb24gd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgcGxhY2VtZW50KSB7XHJcbiAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHBsYWNlbWVudCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBwcm92aWRlZCB0YWJsZSBhbmQgY3JlYXRlIHJlc3VsdHMgbWFwXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlIC0gdGFibGUgcmVzdWx0cyBjb250YWluZXJcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddIC0gc2V0dGluZ3MgZm9yIHBhcnNlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yb3dUYWdzXVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5jZWxsVGFnc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucmVzdWx0c11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucGxhY2VDb2x1bW5dXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnN0YXJ0aW5nUm93XVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2UodGFibGUsIGNvbmZpZykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCBjb25maWcpO1xyXG4gICAgY29uc3Qgcm93cyA9IGFzQXJyYXkodGFibGUucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5yb3dUYWdzKSk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gdG9SZXN1bHRzV2l0aFJlZ0V4cChzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXBDb3VudCA9IHJlc3VsdHNNYXAubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlR2FtZXMocGxheWVyLCBjZWxscykge1xyXG4gICAgICAgIC8vIGlmIGNvbHVtbnMgcm91bmRzIGFyZSBwcm92aWRlZCB0aGVuIHBhcnNlIG9ubHkgdGhlbVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgY2VsbHMgPSBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgocm91bmQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2VsbHNbTnVtYmVyKHJvdW5kKV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50UGxhY2U7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRDbHM7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGNlbGwuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxUKSAmJiBjZWxsLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpKSB7XHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudFBsYWNlID0gTnVtYmVyKGNlbGwuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCkpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q2xzID0gY2VsbC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsLnRleHRDb250ZW50Lm1hdGNoKHJlc3VsdHNNYXBbaV0ucmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50UGxhY2UgPSBOdW1iZXIobWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENscyA9IHJlc3VsdHNNYXBbaV0uY2xzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQsIG9wcG9uZW50UGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxULCByZXN1bHRzTWFwW2ldLmNscyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgY2xzOiByZXN1bHRDbHNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICBsZXQgbGFzdEdyaWRQbGFjZW1lbnQ7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2VsbHMgPSBhc0FycmF5KHJvdy5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLmNlbGxUYWdzKSk7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBkZWZhdWx0IHBsYWNlXHJcbiAgICAgICAgbGV0IGdyaWRQbGFjZW1lbnQgPSAtMTtcclxuXHJcbiAgICAgICAgLy8gbm8gY2VsbHM/IHVubGlrZWx5IHRvIGJlIGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmICghY2VsbHMubGVuZ3RoIHx8ICFjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0pIHtcclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLnRleHRDb250ZW50LCAxMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlOiAtMSxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocm93Lmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSkge1xyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gTnVtYmVyKHJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgbm8gcGxheWVyIGhhcyBiZWVuIG1hcHBlZFxyXG4gICAgICAgICAgICBpZiAoIWxhc3RHcmlkUGxhY2VtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4odG91cm5hbWVudFBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIHRvdXJuYW1lbnQgaWYgZGVmaW5lZCAocG9zc2libHkgc2hvd2luZyBhbiBleHRyYWN0IGZyb20gZ3JlYXRlciB0YWJsZSlcclxuICAgICAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50IHx8IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gbGFzdEdyaWRQbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gc2V0IGEgbG93ZXIgcGxhY2Ugbm9uZXRoZWxlc3NcclxuICAgICAgICAgICAgaWYgKCF0b3VybmFtZW50UGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPyBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA6IDE7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdXJuYW1lbnRQbGFjZW1lbnQgPD0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ3JpZFBsYWNlbWVudCA9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJzZUdhbWVzKHBsYXllciwgY2VsbHMpO1xyXG5cclxuICAgICAgICBwbGF5ZXIudG91cm5hbWVudFBsYWNlID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLnNvcnQoKGEsIGIpID0+IGEgPiBiID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgcmVzdWx0c1tncmlkUGxhY2VtZW50XSA9IHBsYXllcjtcclxuXHJcbiAgICAgICAgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIGxhc3RHcmlkUGxhY2VtZW50ID0gZ3JpZFBsYWNlbWVudDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHRvUmVzdWx0c1dpdGhSZWdFeHAgfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyByYXcgcmVzdWx0cyBzdHJpbmcgaW50byB0YWJsZSB3aXRoIHJvd3MgYW5kIGNlbGxzLlxyXG4gKiBSZXR1cm5zIG51bGwgaWYgbm90IHZhbGlkIGlucHV0LlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmF3UmVzdWx0c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZ11cclxuICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcuc3RhcnRpbmdSb3c9MF0gLSBpbmZvcm1zIHdoZXJlIGlzIHRoZSBmaXJzdCByb3cgd2l0aCByZXN1bHRzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLnBsYWNlQ29sdW1uPTBdIC0gaW5mb3JtcyBpbiB3aGljaCBjb2x1bW4gaXMgdGhlIHBsYWNlIGxvY2F0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcucm91bmRzQ29sdW1uc10gLSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBjb2x1bW5zIHdoZXJlIGdhbWUgcmVzdWx0cyBhcmUgbG9jYXRlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5jZWxsU2VwYXJhdG9yPSdbXFx0IF0rJ10gLSBzZXBhcmF0ZWQgdXNlZCB0byBkaXZpZGUgcm93cyBpbnRvIGNlbGxzXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5qb2luTmFtZXM9dHJ1ZV0gLSBqb2lucyB0d28gY29uc2VjdXRpdmUgY2VsbHMgYWZ0ZXIgdGhlIHBsYWNlIGNvbHVtbiBpbnRvIG9uZSBjZWxsXHJcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxudWxsfVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udmVydFJhd1Jlc3VsdHNUb1RhYmxlKHJhd1Jlc3VsdHMsIGNvbmZpZykge1xyXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHJcbiAgICBpZiAoIXJhd1Jlc3VsdHMpIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgY29uZmlnKTtcclxuICAgIGNvbnN0IGxpbmVzID0gcmF3UmVzdWx0cy5zcGxpdCgvXFxyXFxufFxcbi8pO1xyXG5cclxuICAgIGlmIChsaW5lcy5sZW5ndGggPD0gMiAmJiAhbGluZXNbMF0gJiYgIWxpbmVzWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gdG9SZXN1bHRzV2l0aFJlZ0V4cChzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXBDb3VudCA9IHJlc3VsdHNNYXAubGVuZ3RoO1xyXG5cclxuICAgIGNvbnN0IHJvd3MgPSBsaW5lc1xyXG4gICAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmVcclxuXHJcbiAgICAgICAgICAgIC8vIHByb2JhYmx5IHVuaGVhbHRoeSByZXBsYWNpbmcgc3BhY2UgaW4gcmFuayBpbiBvcmRlciB0byBtYWtlIHN1cmVcclxuICAgICAgICAgICAgLy8gdGhhdCBpdCB3b24ndCBiZSBicm9rZW4gaW50byB0d28gY2VsbHNcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyhbMC05XSspXFxzKGRhbnxreXUpL2ksICckMV8kMicpXHJcblxyXG4gICAgICAgICAgICAvLyBzcGxpdCBsaW5lIHRvIGNlbGxzIChjb25zaWRlciB0YWJzIGFuZCBzcGFjZXMgYXMgc2VwYXJhdG9ycyBieSBkZWZhdWx0KVxyXG4gICAgICAgICAgICAuc3BsaXQobmV3IFJlZ0V4cChzZXR0aW5ncy5jZWxsU2VwYXJhdG9yKSlcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBlbXB0eSBjZWxsc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChjZWxsKSA9PiBjZWxsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGVtcHR5IHJvd3Mgb3Igcm93cyBzdGFydGluZyB3aXRoICc7JyAoRUdEL0ZGRyBjb21tZW50KVxyXG4gICAgICAgIC5maWx0ZXIoKGNlbGxzKSA9PiBjZWxscy5sZW5ndGggPiAwICYmIGNlbGxzWzBdLmluZGV4T2YoJzsnKSAhPT0gMCk7XHJcblxyXG4gICAgY29uc3QgdGFibGVXaWR0aCA9IHJvd3MucmVkdWNlKChwcmV2LCBsaW5lKSA9PiBNYXRoLm1heChwcmV2LCBsaW5lLmxlbmd0aCksIDApO1xyXG4gICAgY29uc3QgdGFibGVNb2RpZmllciA9IHNldHRpbmdzLmpvaW5OYW1lcyA/IC0xIDogMDtcclxuICAgIGNvbnN0IGpvaW5OYW1lUG9zID0gc2V0dGluZ3MucGxhY2VDb2x1bW4gKyAxO1xyXG5cclxuICAgIGxldCBnYW1lc0luQ29sdW1ucyA9IG51bGw7XHJcblxyXG4gICAgLy8gaWYgY29sdW1ucyByb3VuZHMgYXJlIHByb3ZpZGVkIHRoZW4gY29udmVydCBvbmx5IHRoZW1cclxuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBnYW1lc0luQ29sdW1ucyA9IHNldHRpbmdzLnJvdW5kc0NvbHVtbnMuc3BsaXQoJywnKS5tYXAoTnVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcHJldmlvdXNQbGFjZTtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKGNlbGxzLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSBjZWxscy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghd2lkdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cgfHwgd2lkdGggPCAodGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpKSB7XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdjb2xzcGFuJywgdGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpO1xyXG4gICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbHMuam9pbignICcpO1xyXG5cclxuICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCAtMSk7XHJcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLCAxMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocGxhY2UpICYmICFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsQ29udGVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIC0xKTtcclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHByZXZpb3VzUGxhY2UgfHwgcGxhY2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muam9pbk5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbHMuc3BsaWNlKGpvaW5OYW1lUG9zLCAyLCBgJHtjZWxsc1tqb2luTmFtZVBvc119ICAke2NlbGxzW2pvaW5OYW1lUG9zICsgMV19YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbENvbnRlbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbENvbnRlbnQucmVwbGFjZSgvXy8sICcgJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2FtZXNJbkNvbHVtbnMgfHwgZ2FtZXNJbkNvbHVtbnMuaW5kZXhPZihpbmRleCkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHNNYXBDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsQ29udGVudC5tYXRjaChyZXN1bHRzTWFwW2ldLnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudFBsYWNlbWVudCA9IG1hdGNoWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wcG9uZW50cy5wdXNoKG9wcG9uZW50UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCwgb3Bwb25lbnRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQsIHJlc3VsdHNNYXBbaV0uY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UUywgb3Bwb25lbnRzLmpvaW4oJywnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQbGFjZSA9IDI7XHJcbiAgICAgICAgICAgICAgICB9ICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BsYWNlICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRwdXQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG5cclxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUkVTVUxUX1RBQkxFLCAnJyk7XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHt7cHJlZml4Q2xzOiBzdHJpbmcsIHNob3dpbmdEZXRhaWxzQ2xzOiBzdHJpbmcsIHRhYmxlQ2xzOiBzdHJpbmcsIGdhbWVDbHM6IHN0cmluZywgY3VycmVudENsczogc3RyaW5nLCByZXN1bHRzOiB7d29uOiBzdHJpbmcsIGxvc3Q6IHN0cmluZywgamlnbzogc3RyaW5nLCB1bnJlc29sdmVkOiBzdHJpbmd9LCBzdGFydGluZ1JvdzogbnVtYmVyLCBwbGFjZUNvbHVtbjogbnVtYmVyLCByb3VuZHNDb2x1bW5zOiBudWxsLCByb3dUYWdzOiBzdHJpbmcsIGNlbGxUYWdzOiBzdHJpbmcsIHJvd1NlcGFyYXRvcjogc3RyaW5nLCBob3ZlcmluZzogYm9vbGVhbiwgY2xpY2tpbmc6IGJvb2xlYW59fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgICBwcmVmaXhDbHM6ICdnby1yZXN1bHRzLScsXHJcbiAgICBzaG93aW5nRGV0YWlsc0Nsczonc2hvd2luZy1kZXRhaWxzJyxcclxuICAgIHRhYmxlQ2xzOiAndGFibGUnLFxyXG4gICAgZ2FtZUNsczogJ2dhbWUnLFxyXG4gICAgY3VycmVudENsczogJ2N1cnJlbnQnLFxyXG5cclxuICAgIHJlc3VsdHM6IHtcclxuICAgICAgICB3b246ICcoWzAtOV0rKVxcXFwrJyxcclxuICAgICAgICBsb3N0OiAnKFswLTldKylcXFxcLScsXHJcbiAgICAgICAgamlnbzogJyhbMC05XSspPScsXHJcbiAgICAgICAgdW5yZXNvbHZlZDogJyhbMC05XSspXFxcXD8nXHJcbiAgICB9LFxyXG5cclxuICAgIHN0YXJ0aW5nUm93OiAwLFxyXG4gICAgcGxhY2VDb2x1bW46IDAsXHJcbiAgICByb3VuZHNDb2x1bW5zOiBudWxsLFxyXG5cclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJyxcclxuICAgIGNlbGxTZXBhcmF0b3I6ICdbXFx0IF0rJyxcclxuICAgIGpvaW5OYW1lczogdHJ1ZSxcclxuXHJcbiAgICBob3ZlcmluZzogdHJ1ZSxcclxuICAgIGNsaWNraW5nOiB0cnVlXHJcbn07XHJcblxyXG5jb25zdCBDTEFTU0VTX1RPX0JFX1BSRUZJWEVEID0gW1xyXG4gICAgJ3Nob3dpbmdEZXRhaWxzQ2xzJyxcclxuICAgICd0YWJsZUNscycsXHJcbiAgICAnZ2FtZUNscycsXHJcbiAgICAnY3VycmVudENscydcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBOYW1lcyBvZiBhdHRyaWJ1dGVzIHVzZWQgaW4gdGhpcyBwbHVnaW5cclxuICogQHR5cGUge3tSRVNVTFRfVEFCTEU6IHN0cmluZywgU0VUVElOR19TVEFSVElOR19ST1c6IHN0cmluZywgU0VUVElOR19QTEFDRV9DT0xVTU46IHN0cmluZywgU0VUVElOR19ST1VORFNfQ09MVU1OUzogc3RyaW5nLCBQTEFZRVJfUExBQ0VNRU5UOiBzdHJpbmcsIE9QUE9ORU5UX1BMQUNFTUVOVDogc3RyaW5nLCBHQU1FX1JFU1VMVDogc3RyaW5nfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBET01fQVRUUklCVVRFUyA9IHtcclxuICAgIFJFU1VMVF9UQUJMRTogJ2RhdGEtZ28tcmVzdWx0cycsXHJcbiAgICBTRVRUSU5HX1NUQVJUSU5HX1JPVzogJ2RhdGEtZ28tc3RhcnRpbmctcm93JyxcclxuICAgIFNFVFRJTkdfUExBQ0VfQ09MVU1OOiAnZGF0YS1nby1wbGFjZS1jb2wnLFxyXG4gICAgU0VUVElOR19ST1VORFNfQ09MVU1OUzogJ2RhdGEtZ28tcm91bmRzLWNvbHMnLFxyXG4gICAgU0VUVElOR19DTElDS0lORzogJ2RhdGEtZ28tY2xpY2tpbmcnLFxyXG4gICAgU0VUVElOR19IT1ZFUklORzogJ2RhdGEtZ28taG92ZXJpbmcnLFxyXG4gICAgUExBWUVSX1BMQUNFTUVOVDogJ2RhdGEtZ28tcGxhY2UnLFxyXG4gICAgT1BQT05FTlRfUExBQ0VNRU5UOiAnZGF0YS1nby1vcHBvbmVudCcsXHJcbiAgICBPUFBPTkVOVFM6ICdkYXRhLWdvLW9wcG9uZW50cycsXHJcbiAgICBHQU1FX1JFU1VMVDogJ2RhdGEtZ28tcmVzdWx0J1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgbWFwIG9mIHBvc3NpYmxlIHJlc3VsdHMgaW50byBhcnJheSBvZiBvYmplY3RzIHdpdGggcmVnZXhwIHN0cmluZ1xyXG4gKiBjb252ZXJ0ZWQgaW50byBSZWdFeHAgb2JqZWN0cy5cclxuICogQHBhcmFtIHtvYmplY3R9IHJlc3VsdHNcclxuICogQHJldHVybnMge0FycmF5Ljx7Y2xzOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwfT59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9SZXN1bHRzV2l0aFJlZ0V4cChyZXN1bHRzKSB7XHJcbiAgICBjb25zdCBtYXAgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBjbHMgaW4gcmVzdWx0cykge1xyXG4gICAgICAgIGlmIChyZXN1bHRzLmhhc093blByb3BlcnR5KGNscykpIHtcclxuICAgICAgICAgICAgbWFwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY2xzLFxyXG4gICAgICAgICAgICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKHJlc3VsdHNbY2xzXSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG9iamVjdCB3aXRoIHByZWZpeGVkIGNsYXNzZXMgYmFzZWQgb24gc2V0dGluZ3NcclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzXHJcbiAqIEByZXR1cm5zIHt7fX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1ByZWZpeGVkQ2xhc3NlcyhzZXR0aW5ncykge1xyXG4gICAgbGV0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIENMQVNTRVNfVE9fQkVfUFJFRklYRUQuZm9yRWFjaCgoY2xzKSA9PiB7XHJcbiAgICAgICAgcmVzdWx0W2Nsc10gPSBzZXR0aW5ncy5wcmVmaXhDbHMgKyBzZXR0aW5nc1tjbHNdO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0aGUgZWxlbWVudCBmb3IgMyBhdHRyaWJ1dGVzIGFuZCByZXR1cm5zIG9iamVjdCB3aXRoIHNldCBhcHByb3ByaWF0ZVxyXG4gKiB2YWx1ZXNcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGVcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00odGFibGUpIHtcclxuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19QTEFDRV9DT0xVTU4pKSB7XHJcbiAgICAgICAgb3V0cHV0LnBsYWNlQ29sdW1uID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1BMQUNFX0NPTFVNTikpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19TVEFSVElOR19ST1cpKSB7XHJcbiAgICAgICAgb3V0cHV0LnN0YXJ0aW5nUm93ID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1NUQVJUSU5HX1JPVykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19ST1VORFNfQ09MVU1OUykpIHtcclxuICAgICAgICBvdXRwdXQucm91bmRzQ29sdW1ucyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1JPVU5EU19DT0xVTU5TKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpKSB7XHJcbiAgICAgICAgb3V0cHV0LmNsaWNraW5nID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpICE9PSAnZmFsc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykpIHtcclxuICAgICAgICBvdXRwdXQuaG92ZXJpbmcgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykgIT09ICdmYWxzZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGFycmF5LWxpa2Ugb2JqZWN0cyAoc3VjaCBhcyBhcmd1bWVudHMgb3Igbm9kZSBsaXN0cykgaW50byBhbiBhcnJheVxyXG4gKiBAcGFyYW0geyp9IGFycmF5TGlrZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFQ+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzQXJyYXkoYXJyYXlMaWtlKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCBjb250YWluaW5nIGtleXMgb25seSBmcm9tIGRlZmF1bHRPYmogYnV0IHZhbHVlcyBhcmUgdGFrZW5cclxuICogZnJvbSBpZiBleGlzdCAoc3RhcnRpbmcgZnJvbSB0aGUgbGFzdCBvYmplY3QgcHJvdmlkZWQpXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0T2JqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IC4uLm9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cyhkZWZhdWx0T2JqLCAuLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCBvdmVycmlkZXMgPSBvYmplY3RzXHJcbiAgICAgICAgLmZpbHRlcigob2JqKSA9PiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JylcclxuICAgICAgICAucmV2ZXJzZSgpO1xyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gb3ZlcnJpZGVzLmxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG1haW5Mb29wOiBmb3IgKGxldCBrZXkgaW4gZGVmYXVsdE9iaikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAob3ZlcnJpZGVzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb3ZlcnJpZGVzW2ldW2tleV07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBtYWluTG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzdWx0W2tleV0gPSBkZWZhdWx0T2JqW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCB0aGF0IGhhcyBtZXJnZWQgcHJvcGVydGllcyBmcm9tIGFsbCBwcm92aWRlZCBvYmplY3RzLlxyXG4gKiBMYXRlc3QgYXJndW1lbnRzIG92ZXJyaWRlcyB0aGUgZWFybGllciB2YWx1ZXMuXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lKC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG9iamVjdHMuZm9yRWFjaCgob2JqZWN0KSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59Il19
(1)
});
