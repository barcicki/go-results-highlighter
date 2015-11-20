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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImZha2VfZTNkYjBmZTQuanMiLCJoaWdobGlnaHRlci5qcyIsInBhcnNlci5qcyIsInJhdzJ0YWJsZS5qcyIsInNldHRpbmdzLmpzIiwidXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNYixTQUFTLFVBQVUsR0FBRztBQUNsQixlQUhLLE9BQU8sRUFHSixRQUFRLENBQUMsZ0JBQWdCLE9BQUssVUFKakMsY0FBYyxDQUlrQyxZQUFZLE9BQUksQ0FBQyxDQUNqRSxPQUFPLENBQUMsVUFBQyxPQUFPO2VBQUssMEJBQXlCLE9BQU8sQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNoRTs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOztBQUVELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQy9CLFVBQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDaEQsWUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDaEMsZ0JBQUksV0FBVyxHQUFHLDBCQUF5QixPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTdELGFBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3BFLENBQUMsQ0FBQztBQUNILGVBQU8sSUFBSSxDQUFDO0tB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Q2pDOztBQUVELFdBQU8sTUFBTSxDQUFDO0NBQ2pCOzs7Ozs7OztBQUFBLEFBUU0sU0FBUyxPQUFPLEdBQWE7QUFDaEMsUUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDOzt1Q0FESyxPQUFPO0FBQVAsZUFBTzs7O0FBRzlCLFdBQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDeEIsYUFBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUU7QUFDcEIsZ0JBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1QixzQkFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM3QjtTQUNKO0tBQ0osQ0FBQyxDQUFDOztBQUVILFdBQU8sTUFBTSxDQUFDO0NBQ2pCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBHb1Jlc3VsdHNIaWdobGlnaHRlciBmcm9tICcuL2xpYi9oaWdobGlnaHRlcic7XHJcbmltcG9ydCB7IERPTV9BVFRSSUJVVEVTIH0gZnJvbSAnLi9saWIvc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBhc0FycmF5IH0gZnJvbSAnLi9saWIvdXRpbHMnO1xyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgIGFzQXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgWyR7RE9NX0FUVFJJQlVURVMuUkVTVUxUX1RBQkxFfV1gKSlcclxuICAgICAgICAuZm9yRWFjaCgodGFibGVFbCkgPT4gbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKHRhYmxlRWwpKTtcclxufVxyXG5cclxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgIGluaXRpYWxpemUoKTtcclxufSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0aWFsaXplLCBmYWxzZSk7XHJcbn1cclxuXHJcbmlmICh0eXBlb2YgalF1ZXJ5ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgalF1ZXJ5LmZuLmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlciA9IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcihlbGVtZW50LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgICQoaGlnaGxpZ2h0ZXIuZWxlbWVudCkuZGF0YSgnR29SZXN1bHRzSGlnaGxpZ2h0ZXInLCBoaWdobGlnaHRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9QcmVmaXhlZENsYXNzZXMsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTSB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wYXJzZXInO1xyXG5pbXBvcnQgY29udmVydCBmcm9tICcuL3JhdzJ0YWJsZSc7XHJcbmltcG9ydCB7IGFzQXJyYXksIGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb1Jlc3VsdHNIaWdobGlnaHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBHb1Jlc3VsdHNIaWdobGlnaHRlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBtYWluIGVsZW1lbnQgY29udGFpbmluZyB0YWJsZSB3aXRoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIC0gcGx1Z2luIHNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLmNvbHVtbj0wXSAtIGluZGV4IG9mIHRoZSBjb2x1bW5cclxuICAgICAqIHdoZXJlIHRoZSBzY3JpcHQgc2hvdWxkIGV4cGVjdCB0byBmaW5kIHBsYXllcidzIHBsYWNlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5yb3c9MF0gLSBzdGFydGluZyByb3cgd2l0aCBwbGF5ZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnByZWZpeENscz0nZ28tcmVzdWx0cy0nXSAtIGNzcyBjbGFzcyBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuZ2FtZUNscz0nZ2FtZSddIC0gZ2FtZSBjZWxsIGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY3VycmVudENscz0nY3VycmVudCddIC0gc2VsZWN0ZWQgcm93IGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3MucmVzdWx0c10gLSBtYXAgd2l0aCBwb3NzaWJsZSByZXN1bHRzLCBieSBkZWZhdWx0XHJcbiAgICAgKiBzdXBwb3J0cyA0IG9wdGlvbnMuIFByb3ZpZGUgd2l0aCBcImNsYXNzTmFtZVwiIC0+IFwicmVnZXhwXCIgcGF0dGVybi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy53b249JyhbMC05XSspXFxcXCsnXSAtIGRlZmF1bHQgd2lubmluZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5sb3N0PScoWzAtOV0rKVxcXFwtJ10gLSBkZWZhdWx0IGxvc2luZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5qaWdvPScoWzAtOV0rKT0nXSAtIGRlZmF1bHQgZHJhdyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy51bnJlc29sdmVkPScoWzAtOV0rKVxcXFw/XSAtIGRlZmF1bHQgdW5yZXNvbHZlZCByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFncz0ndHInXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGUgc3RyaW5nXHJcbiAgICAgKiB3aXRoIHRhZ3MgcmVwcmVzZW50aW5nIHBsYXllcnMnIHJvd3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY2VsbFRhZ3M9J3RkLHRoJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlXHJcbiAgICAgKiBzdHJpbmcgd2l0aCB0YWdzIGhvbGRpbmcgZ2FtZSByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTShlbGVtZW50KSwgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxQcmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9IGNvbnZlcnQoZWxlbWVudC5pbm5lckhUTUwsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGFibGUsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0YWJsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgIC8vIG5vdCBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzTWFwKCk7XHJcbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy50YWJsZUNscyk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gdGhpcztcclxuICAgICAgICB0aGlzLmlzU2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgcGxheWVycyBtYXBcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUGxheWVyc01hcCgpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IHBhcnNlKHRoaXMuZWxlbWVudCwgdGhpcy5zZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsYWNlbWVudCBpbiB0aGlzLm1hcCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkocGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2godGhpcy5tYXBbcGxhY2VtZW50XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyBwbGF5ZXIgYW5kIGhpcyBvcHBvbmVudHMgaGlnaGxpZ2h0ZWQuXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdHxudW1iZXJ8bnVsbH0gW3NldHRpbmdzXSAtIGhpZ2hsaWdodGluZyBzZXR0aW5ncyBvciBwbGF5ZXIgdG8gYmUgaGlnaGxpZ2h0ZWRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3MucGxheWVyXSAtIHBsYXllciB3aG9zZSBvcHBvbmVudHMgc2hvdWxkIGJlXHJcbiAgICAgKiBoaWdobGlnaHRlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2V0dGluZ3MuY29tcGFjdD1mYWxzZV0gLSB3aGV0aGVyIHRoZSB0YWJsZSBzaG91bGQgYmVcclxuICAgICAqIHJlYXJyYW5nZWQgdG8gZGlzcGxheSByZXN1bHRzIGluIGNvbXBhY3Qgc2l6ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5vcHBvbmVudF0gLSB0aGUgb3Bwb25lbnQgd2hvc2UgZ2FtZSB3aXRoIHRoZVxyXG4gICAgICogcGxheWVyIHNob3VsZCBiZSBoaWdobGlnaHRlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY29tcGFjdD1mYWxzZV0gLSBpZiBzZXR0aW5ncyBhcmUgbm90IHByb3ZpZGVkIHRoYW4gdGhpc1xyXG4gICAgICogYXJndW1lbnQgaXMgY2hlY2tlZCBmb3IgY29tcGFjdCBmbGFnXHJcbiAgICAgKi9cclxuICAgIGhpZ2hsaWdodChzZXR0aW5ncywgY29tcGFjdCA9IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHBsYXllclBsYWNlO1xyXG4gICAgICAgIGxldCBnYW1lV2l0aE9wcG9uZW50O1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MgJiYgdHlwZW9mIHNldHRpbmdzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBwbGF5ZXJQbGFjZSA9IHNldHRpbmdzLnBsYXllcjtcclxuICAgICAgICAgICAgY29tcGFjdCA9IHNldHRpbmdzLmNvbXBhY3QgPT09IHRydWU7XHJcbiAgICAgICAgICAgIGdhbWVXaXRoT3Bwb25lbnQgPSBzZXR0aW5ncy5vcHBvbmVudDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwbGF5ZXJQbGFjZSA9IHNldHRpbmdzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5tYXBbcGxheWVyUGxhY2VdO1xyXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSB0b1ByZWZpeGVkQ2xhc3Nlcyh0aGlzLnNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgLy8gaWYgdGFibGUgaXMgYWxyZWFkeSByZWFycmFuZ2VkIHRoZW4gdHJhbnNmb3JtIGl0IGJhY2sgdG8gZGVmYXVsdCBzdGF0ZVxyXG4gICAgICAgIGlmICh0aGlzLmlzU2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgcmVzdG9yZU5hdHVyYWxPcmRlcih0aGlzLnBsYXllcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVhcnJhbmdlIHRoZSB0YWJsZSBpZiBwbGF5ZXIgYW5kIGFwcHJvcHJpYXRlIHNldHRpbmcgaXMgcHJvdmlkZWRcclxuICAgICAgICBpZiAocGxheWVyICYmIGNvbXBhY3QpIHtcclxuICAgICAgICAgICAgcmVhcnJhbmdlT3JkZXIocGxheWVyLCBwbGF5ZXIub3Bwb25lbnRzLm1hcCgob3Bwb25lbnRQbGFjZSkgPT4gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV0pKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuc2hvd2luZ0RldGFpbHNDbHMpO1xyXG4gICAgICAgICAgICB0aGlzLmlzU2hvd2luZ0RldGFpbHMgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuc2hvd2luZ0RldGFpbHNDbHMpO1xyXG4gICAgICAgICAgICB0aGlzLmlzU2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1hcmtlZEdhbWVzID0gYXNBcnJheSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLicgKyBjbGFzc2VzLmdhbWVDbHMpKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBjbGFzc2VzLmN1cnJlbnRDbHMpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvd1BsYWNlbWVudCA9IG1hcmtlZFJvdyA/IG1hcmtlZFJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFBsYXllciA9IG1hcmtlZFJvd1BsYWNlbWVudCA/IHRoaXMubWFwW21hcmtlZFJvd1BsYWNlbWVudF0gOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IG1hcmsgPSAocGxheWVyLCBhY3RpdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0W21ldGhvZF0oY2xhc3Nlcy5jdXJyZW50Q2xzKTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnRQbGFjZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICAgICAgb3Bwb25lbnQucm93LmNsYXNzTGlzdFttZXRob2RdKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNscyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBhbnkgdmlzaWJsZSBnYW1lIG1hcmtpbmdzXHJcbiAgICAgICAgbWFya2VkR2FtZXMuZm9yRWFjaCgoZ2FtZUNlbGwpID0+IHtcclxuICAgICAgICAgICAgZ2FtZUNlbGwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzLmdhbWVDbHMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1bm1hcmsgcGxheWVyIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgIGlmIChtYXJrZWRQbGF5ZXIgJiYgbWFya2VkUGxheWVyICE9PSBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyayhtYXJrZWRQbGF5ZXIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIHBsYXllciBpZiBub3QgYWxyZWFkeSBtYXJrZWRcclxuICAgICAgICBpZiAocGxheWVyICYmIHBsYXllciAhPT0gbWFya2VkUGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsocGxheWVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVXaXRoT3Bwb25lbnQgJiYgdGhpcy5tYXBbZ2FtZVdpdGhPcHBvbmVudF0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBnYW1lID0gcGxheWVyLmdhbWVzW2dhbWVXaXRoT3Bwb25lbnRdO1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbZ2FtZVdpdGhPcHBvbmVudF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGdhbWUgJiYgb3Bwb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBnYW1lLmNlbGwuY2xhc3NMaXN0LmFkZChjbGFzc2VzLmdhbWVDbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50LmdhbWVzW3BsYXllclBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5nYW1lQ2xzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcFtvcHBvbmVudF0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChjbGFzc2VzLmdhbWVDbHMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZHMgbW91c2VvdmVyIGFuZCBtb3VzZW91dCBldmVudHMgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBiaW5kRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5jbGlja2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IHBsYXllclBsYWNlbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwbGF5ZXIgcm93PyBubyBmdXJ0aGVyIHNlYXJjaCBpcyBuZWNlc3NhcnlcclxuICAgICAgICAgICAgICAgIGlmIChwbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJQbGFjZW1lbnQgPSBOdW1iZXIocGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGxhc3RUYXJnZXRQb3M7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQocGxheWVyUGxhY2VtZW50LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LnByb3Blck5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0VGFyZ2V0UG9zID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodChwbGF5ZXJQbGFjZW1lbnQsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhc3RUYXJnZXRQb3MgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQocGxheWVyUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoLTEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFzdFRhcmdldFBvcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCBkaWZmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLmlzU2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRHcmlkUGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllckdyaWRQbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGdhbWUgY2VsbD9cclxuICAgICAgICAgICAgICAgIGlmIChvcHBvbmVudEdyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHBvbmVudCA9IE51bWJlcihvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllckdyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSBOdW1iZXIocGxheWVyR3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHsgcGxheWVyLCBvcHBvbmVudCB9KTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50ICYmIHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgbmV3IGhvdmVyZWQgZWxlbWVudCBpcyBvdXRzaWRlIHRoZSB0YWJsZSB0aGVuIHJlbW92ZSBhbGxcclxuICAgICAgICAgICAgLy8gc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc3RvcmVzIGRlZmF1bHQgb3JkZXIgb2Ygcm93cyBpbiB0aGUgdGFibGVcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gcGxheWVycyAtIGxpc3Qgb2YgbWFwcGluZyBkYXRhIGZvciBhbGwgcm93c1xyXG4gKi9cclxuZnVuY3Rpb24gcmVzdG9yZU5hdHVyYWxPcmRlcihwbGF5ZXJzKSB7XHJcbiAgICBwbGF5ZXJzXHJcbiAgICAgICAgLmZpbHRlcigocGxheWVyKSA9PiBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nKVxyXG4gICAgICAgIC5yZXZlcnNlKClcclxuICAgICAgICAuZm9yRWFjaCgocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHBsYXllci5yb3cpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwbGF5ZXIucm93LCBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nID0gbnVsbDtcclxuICAgICAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlYXJyYW5nZXMgdGhlIHJvd3MgaW4gYSB0YWJsZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gcGxheWVyIC0gcGxheWVyIG1hcHBpbmcgZGF0YVxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBvcHBvbmVudHMgLSBsaXN0IG9mIG9wcG9uZW50cyBtYXBwaW5nIGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIHJlYXJyYW5nZU9yZGVyKHBsYXllciwgb3Bwb25lbnRzKSB7XHJcbiAgICBjb25zdCBwYXJlbnQgPSBwbGF5ZXIucm93LnBhcmVudE5vZGU7XHJcbiAgICBsZXQgYWZ0ZXIgPSBwbGF5ZXIucm93Lm5leHRFbGVtZW50U2libGluZztcclxuXHJcbiAgICBvcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnQpID0+IHtcclxuICAgICAgICBvcHBvbmVudC5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBvcHBvbmVudC5yb3cubmV4dEVsZW1lbnRTaWJsaW5nIHx8IC0xO1xyXG5cclxuICAgICAgICBpZiAob3Bwb25lbnQudG91cm5hbWVudFBsYWNlIDwgcGxheWVyLnRvdXJuYW1lbnRQbGFjZSkge1xyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgcGxheWVyLnJvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShvcHBvbmVudC5yb3csIGFmdGVyKTtcclxuICAgICAgICAgICAgYWZ0ZXIgPSBvcHBvbmVudC5yb3cubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5Hb1Jlc3VsdHNIaWdobGlnaHRlci5ERUZBVUxUX1NFVFRJTkdTID0gREVGQVVMVF9TRVRUSU5HUztcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgYXNBcnJheSwgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHRvUmVzdWx0c1dpdGhSZWdFeHAgfSBmcm9tICcuL3NldHRpbmdzJztcclxuXHJcbmZ1bmN0aW9uIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIHBsYWNlbWVudCkge1xyXG4gICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCBwbGFjZW1lbnQpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhdmVyc2UgcHJvdmlkZWQgdGFibGUgYW5kIGNyZWF0ZSByZXN1bHRzIG1hcFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZSAtIHRhYmxlIHJlc3VsdHMgY29udGFpbmVyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnXSAtIHNldHRpbmdzIGZvciBwYXJzZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcucm93VGFnc11cclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuY2VsbFRhZ3NdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnJlc3VsdHNdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnBsYWNlQ29sdW1uXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5yb3VuZHNDb2x1bW5zXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5zdGFydGluZ1Jvd11cclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlKHRhYmxlLCBjb25maWcpIHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgY29uZmlnKTtcclxuICAgIGNvbnN0IHJvd3MgPSBhc0FycmF5KHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3Mucm93VGFncykpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IHRvUmVzdWx0c1dpdGhSZWdFeHAoc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwQ291bnQgPSByZXN1bHRzTWFwLmxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZUdhbWVzKHBsYXllciwgY2VsbHMpIHtcclxuICAgICAgICAvLyBpZiBjb2x1bW5zIHJvdW5kcyBhcmUgcHJvdmlkZWQgdGhlbiBwYXJzZSBvbmx5IHRoZW1cclxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLnJvdW5kc0NvbHVtbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGNlbGxzID0gc2V0dGluZ3Mucm91bmRzQ29sdW1uc1xyXG4gICAgICAgICAgICAgICAgLnNwbGl0KCcsJylcclxuICAgICAgICAgICAgICAgIC5tYXAoKHJvdW5kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNlbGxzW051bWJlcihyb3VuZCldO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudFBsYWNlO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0Q2xzO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmIChjZWxsLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCkgJiYgY2VsbC5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKSkge1xyXG4gICAgICAgICAgICAgICAgb3Bwb25lbnRQbGFjZSA9IE51bWJlcihjZWxsLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdENscyA9IGNlbGwuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxUKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHNNYXBDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gY2VsbC50ZXh0Q29udGVudC5tYXRjaChyZXN1bHRzTWFwW2ldLnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBvcHBvbmVudFBsYWNlID0gTnVtYmVyKG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRDbHMgPSByZXN1bHRzTWFwW2ldLmNscztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5ULCBvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCwgcmVzdWx0c01hcFtpXS5jbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdID0ge1xyXG4gICAgICAgICAgICAgICAgY2VsbCxcclxuICAgICAgICAgICAgICAgIGNsczogcmVzdWx0Q2xzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLnB1c2gob3Bwb25lbnRQbGFjZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgbGV0IGxhc3RHcmlkUGxhY2VtZW50O1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnN0YXJ0aW5nUm93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXNBcnJheShyb3cucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5jZWxsVGFncykpO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gZGVmYXVsdCBwbGFjZVxyXG4gICAgICAgIGxldCBncmlkUGxhY2VtZW50ID0gLTE7XHJcblxyXG4gICAgICAgIC8vIG5vIGNlbGxzPyB1bmxpa2VseSB0byBiZSBhIHJlc3VsdCByb3dcclxuICAgICAgICBpZiAoIWNlbGxzLmxlbmd0aCB8fCAhY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dKSB7XHJcbiAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG91cm5hbWVudFBsYWNlbWVudCA9IHBhcnNlSW50KGNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB7XHJcbiAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZTogLTEsXHJcbiAgICAgICAgICAgIHJvdyxcclxuICAgICAgICAgICAgZ2FtZXM6IHt9LFxyXG4gICAgICAgICAgICBvcHBvbmVudHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHJvdy5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkpIHtcclxuICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IE51bWJlcihyb3cuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG5vIHBsYXllciBoYXMgYmVlbiBtYXBwZWRcclxuICAgICAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1vc3QgcHJvYmFibHkgbm90IGEgcmVzdWx0IHJvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRvdXJuYW1lbnRQbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiB0b3VybmFtZW50IGlmIGRlZmluZWQgKHBvc3NpYmx5IHNob3dpbmcgYW4gZXh0cmFjdCBmcm9tIGdyZWF0ZXIgdGFibGUpXHJcbiAgICAgICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudCB8fCAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IGxhc3RHcmlkUGxhY2VtZW50ICsgMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYXNzdW1wdGlvbjogaWYgcGxhY2UgaXMgbm90IHByb3ZpZGVkIHRoZW4gaXQncyBhbiBleCBhZXF1byBjYXNlIGJ1dFxyXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHNldCBhIGxvd2VyIHBsYWNlIG5vbmV0aGVsZXNzXHJcbiAgICAgICAgICAgIGlmICghdG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID8gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgOiAxO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b3VybmFtZW50UGxhY2VtZW50IDw9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdyaWRQbGFjZW1lbnQgPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyc2VHYW1lcyhwbGF5ZXIsIGNlbGxzKTtcclxuXHJcbiAgICAgICAgcGxheWVyLnRvdXJuYW1lbnRQbGFjZSA9IHRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgcGxheWVyLm9wcG9uZW50cy5zb3J0KChhLCBiKSA9PiBhID4gYiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIHJlc3VsdHNbZ3JpZFBsYWNlbWVudF0gPSBwbGF5ZXI7XHJcblxyXG4gICAgICAgIGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBsYXN0R3JpZFBsYWNlbWVudCA9IGdyaWRQbGFjZW1lbnQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1Jlc3VsdHNXaXRoUmVnRXhwIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG4vKipcclxuICogQ29udmVydHMgcmF3IHJlc3VsdHMgc3RyaW5nIGludG8gdGFibGUgd2l0aCByb3dzIGFuZCBjZWxscy5cclxuICogUmV0dXJucyBudWxsIGlmIG5vdCB2YWxpZCBpbnB1dC5cclxuICogQHBhcmFtIHtzdHJpbmd9IHJhd1Jlc3VsdHNcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLnN0YXJ0aW5nUm93PTBdIC0gaW5mb3JtcyB3aGVyZSBpcyB0aGUgZmlyc3Qgcm93IHdpdGggcmVzdWx0c1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5wbGFjZUNvbHVtbj0wXSAtIGluZm9ybXMgaW4gd2hpY2ggY29sdW1uIGlzIHRoZSBwbGFjZSBsb2NhdGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdIC0gY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY29sdW1ucyB3aGVyZSBnYW1lIHJlc3VsdHMgYXJlIGxvY2F0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuY2VsbFNlcGFyYXRvcj0nW1xcdCBdKyddIC0gc2VwYXJhdGVkIHVzZWQgdG8gZGl2aWRlIHJvd3MgaW50byBjZWxsc1xyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maWcuam9pbk5hbWVzPXRydWVdIC0gam9pbnMgdHdvIGNvbnNlY3V0aXZlIGNlbGxzIGFmdGVyIHRoZSBwbGFjZSBjb2x1bW4gaW50byBvbmUgY2VsbFxyXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8bnVsbH1cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnZlcnRSYXdSZXN1bHRzVG9UYWJsZShyYXdSZXN1bHRzLCBjb25maWcpIHtcclxuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKCFyYXdSZXN1bHRzKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIGNvbmZpZyk7XHJcbiAgICBjb25zdCBsaW5lcyA9IHJhd1Jlc3VsdHMuc3BsaXQoL1xcclxcbnxcXG4vKTtcclxuXHJcbiAgICBpZiAobGluZXMubGVuZ3RoIDw9IDIgJiYgIWxpbmVzWzBdICYmICFsaW5lc1sxXSkge1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IHRvUmVzdWx0c1dpdGhSZWdFeHAoc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwQ291bnQgPSByZXN1bHRzTWFwLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCByb3dzID0gbGluZXNcclxuICAgICAgICAubWFwKChsaW5lKSA9PiBsaW5lXHJcblxyXG4gICAgICAgICAgICAvLyBwcm9iYWJseSB1bmhlYWx0aHkgcmVwbGFjaW5nIHNwYWNlIGluIHJhbmsgaW4gb3JkZXIgdG8gbWFrZSBzdXJlXHJcbiAgICAgICAgICAgIC8vIHRoYXQgaXQgd29uJ3QgYmUgYnJva2VuIGludG8gdHdvIGNlbGxzXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8oWzAtOV0rKVxccyhkYW58a3l1KS9pLCAnJDFfJDInKVxyXG5cclxuICAgICAgICAgICAgLy8gc3BsaXQgbGluZSB0byBjZWxscyAoY29uc2lkZXIgdGFicyBhbmQgc3BhY2VzIGFzIHNlcGFyYXRvcnMgYnkgZGVmYXVsdClcclxuICAgICAgICAgICAgLnNwbGl0KG5ldyBSZWdFeHAoc2V0dGluZ3MuY2VsbFNlcGFyYXRvcikpXHJcblxyXG4gICAgICAgICAgICAvLyByZW1vdmUgZW1wdHkgY2VsbHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2VsbCkgPT4gY2VsbC5sZW5ndGggPiAwKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIG91dCBlbXB0eSByb3dzIG9yIHJvd3Mgc3RhcnRpbmcgd2l0aCAnOycgKEVHRC9GRkcgY29tbWVudClcclxuICAgICAgICAuZmlsdGVyKChjZWxscykgPT4gY2VsbHMubGVuZ3RoID4gMCAmJiBjZWxsc1swXS5pbmRleE9mKCc7JykgIT09IDApO1xyXG5cclxuICAgIGNvbnN0IHRhYmxlV2lkdGggPSByb3dzLnJlZHVjZSgocHJldiwgbGluZSkgPT4gTWF0aC5tYXgocHJldiwgbGluZS5sZW5ndGgpLCAwKTtcclxuICAgIGNvbnN0IHRhYmxlTW9kaWZpZXIgPSBzZXR0aW5ncy5qb2luTmFtZXMgPyAtMSA6IDA7XHJcbiAgICBjb25zdCBqb2luTmFtZVBvcyA9IHNldHRpbmdzLnBsYWNlQ29sdW1uICsgMTtcclxuXHJcbiAgICBsZXQgZ2FtZXNJbkNvbHVtbnMgPSBudWxsO1xyXG5cclxuICAgIC8vIGlmIGNvbHVtbnMgcm91bmRzIGFyZSBwcm92aWRlZCB0aGVuIGNvbnZlcnQgb25seSB0aGVtXHJcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLnJvdW5kc0NvbHVtbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZ2FtZXNJbkNvbHVtbnMgPSBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zLnNwbGl0KCcsJykubWFwKE51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHByZXZpb3VzUGxhY2U7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChjZWxscywgaW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gY2VsbHMubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoIXdpZHRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnN0YXJ0aW5nUm93IHx8IHdpZHRoIDwgKHRhYmxlV2lkdGggKyB0YWJsZU1vZGlmaWVyKSkge1xyXG4gICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZSgnY29sc3BhbicsIHRhYmxlV2lkdGggKyB0YWJsZU1vZGlmaWVyKTtcclxuICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxzLmpvaW4oJyAnKTtcclxuXHJcbiAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgLTEpO1xyXG4gICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwbGFjZSA9IHBhcnNlSW50KGNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXSwgMTApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHBsYWNlKSAmJiAhcHJldmlvdXNQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbENvbnRlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxsQ29udGVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCBwcmV2aW91c1BsYWNlIHx8IHBsYWNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmpvaW5OYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzLnNwbGljZShqb2luTmFtZVBvcywgMiwgYCR7Y2VsbHNbam9pbk5hbWVQb3NdfSAgJHtjZWxsc1tqb2luTmFtZVBvcyArIDFdfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGxDb250ZW50LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxDb250ZW50LnJlcGxhY2UoL18vLCAnICcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWdhbWVzSW5Db2x1bW5zIHx8IGdhbWVzSW5Db2x1bW5zLmluZGV4T2YoaW5kZXgpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzTWFwQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gY2VsbENvbnRlbnQubWF0Y2gocmVzdWx0c01hcFtpXS5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRQbGFjZW1lbnQgPSBtYXRjaFsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQsIG9wcG9uZW50UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxULCByZXN1bHRzTWFwW2ldLmNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvcHBvbmVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVFMsIG9wcG9uZW50cy5qb2luKCcsJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcHJldmlvdXNQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUGxhY2UgPSAyO1xyXG4gICAgICAgICAgICAgICAgfSAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQbGFjZSArPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3V0cHV0LmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlJFU1VMVF9UQUJMRSwgJycpO1xyXG5cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgc2V0dGluZ3Mgb2YgdGhlIHBsdWdpblxyXG4gKiBAdHlwZSB7e3ByZWZpeENsczogc3RyaW5nLCBzaG93aW5nRGV0YWlsc0Nsczogc3RyaW5nLCB0YWJsZUNsczogc3RyaW5nLCBnYW1lQ2xzOiBzdHJpbmcsIGN1cnJlbnRDbHM6IHN0cmluZywgcmVzdWx0czoge3dvbjogc3RyaW5nLCBsb3N0OiBzdHJpbmcsIGppZ286IHN0cmluZywgdW5yZXNvbHZlZDogc3RyaW5nfSwgc3RhcnRpbmdSb3c6IG51bWJlciwgcGxhY2VDb2x1bW46IG51bWJlciwgcm91bmRzQ29sdW1uczogbnVsbCwgcm93VGFnczogc3RyaW5nLCBjZWxsVGFnczogc3RyaW5nLCByb3dTZXBhcmF0b3I6IHN0cmluZywgaG92ZXJpbmc6IGJvb2xlYW4sIGNsaWNraW5nOiBib29sZWFufX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xyXG4gICAgcHJlZml4Q2xzOiAnZ28tcmVzdWx0cy0nLFxyXG4gICAgc2hvd2luZ0RldGFpbHNDbHM6J3Nob3dpbmctZGV0YWlscycsXHJcbiAgICB0YWJsZUNsczogJ3RhYmxlJyxcclxuICAgIGdhbWVDbHM6ICdnYW1lJyxcclxuICAgIGN1cnJlbnRDbHM6ICdjdXJyZW50JyxcclxuXHJcbiAgICByZXN1bHRzOiB7XHJcbiAgICAgICAgd29uOiAnKFswLTldKylcXFxcKycsXHJcbiAgICAgICAgbG9zdDogJyhbMC05XSspXFxcXC0nLFxyXG4gICAgICAgIGppZ286ICcoWzAtOV0rKT0nLFxyXG4gICAgICAgIHVucmVzb2x2ZWQ6ICcoWzAtOV0rKVxcXFw/J1xyXG4gICAgfSxcclxuXHJcbiAgICBzdGFydGluZ1JvdzogMCxcclxuICAgIHBsYWNlQ29sdW1uOiAwLFxyXG4gICAgcm91bmRzQ29sdW1uczogbnVsbCxcclxuXHJcbiAgICByb3dUYWdzOiAndHInLFxyXG4gICAgY2VsbFRhZ3M6ICd0ZCx0aCcsXHJcbiAgICBjZWxsU2VwYXJhdG9yOiAnW1xcdCBdKycsXHJcbiAgICBqb2luTmFtZXM6IHRydWUsXHJcblxyXG4gICAgaG92ZXJpbmc6IHRydWUsXHJcbiAgICBjbGlja2luZzogdHJ1ZVxyXG59O1xyXG5cclxuY29uc3QgQ0xBU1NFU19UT19CRV9QUkVGSVhFRCA9IFtcclxuICAgICdzaG93aW5nRGV0YWlsc0NscycsXHJcbiAgICAndGFibGVDbHMnLFxyXG4gICAgJ2dhbWVDbHMnLFxyXG4gICAgJ2N1cnJlbnRDbHMnXHJcbl07XHJcblxyXG4vKipcclxuICogTmFtZXMgb2YgYXR0cmlidXRlcyB1c2VkIGluIHRoaXMgcGx1Z2luXHJcbiAqIEB0eXBlIHt7UkVTVUxUX1RBQkxFOiBzdHJpbmcsIFNFVFRJTkdfU1RBUlRJTkdfUk9XOiBzdHJpbmcsIFNFVFRJTkdfUExBQ0VfQ09MVU1OOiBzdHJpbmcsIFNFVFRJTkdfUk9VTkRTX0NPTFVNTlM6IHN0cmluZywgUExBWUVSX1BMQUNFTUVOVDogc3RyaW5nLCBPUFBPTkVOVF9QTEFDRU1FTlQ6IHN0cmluZywgR0FNRV9SRVNVTFQ6IHN0cmluZ319XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRE9NX0FUVFJJQlVURVMgPSB7XHJcbiAgICBSRVNVTFRfVEFCTEU6ICdkYXRhLWdvLXJlc3VsdHMnLFxyXG4gICAgU0VUVElOR19TVEFSVElOR19ST1c6ICdkYXRhLWdvLXN0YXJ0aW5nLXJvdycsXHJcbiAgICBTRVRUSU5HX1BMQUNFX0NPTFVNTjogJ2RhdGEtZ28tcGxhY2UtY29sJyxcclxuICAgIFNFVFRJTkdfUk9VTkRTX0NPTFVNTlM6ICdkYXRhLWdvLXJvdW5kcy1jb2xzJyxcclxuICAgIFNFVFRJTkdfQ0xJQ0tJTkc6ICdkYXRhLWdvLWNsaWNraW5nJyxcclxuICAgIFNFVFRJTkdfSE9WRVJJTkc6ICdkYXRhLWdvLWhvdmVyaW5nJyxcclxuICAgIFBMQVlFUl9QTEFDRU1FTlQ6ICdkYXRhLWdvLXBsYWNlJyxcclxuICAgIE9QUE9ORU5UX1BMQUNFTUVOVDogJ2RhdGEtZ28tb3Bwb25lbnQnLFxyXG4gICAgT1BQT05FTlRTOiAnZGF0YS1nby1vcHBvbmVudHMnLFxyXG4gICAgR0FNRV9SRVNVTFQ6ICdkYXRhLWdvLXJlc3VsdCdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIG1hcCBvZiBwb3NzaWJsZSByZXN1bHRzIGludG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHJlZ2V4cCBzdHJpbmdcclxuICogY29udmVydGVkIGludG8gUmVnRXhwIG9iamVjdHMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXN1bHRzXHJcbiAqIEByZXR1cm5zIHtBcnJheS48e2Nsczogc3RyaW5nLCByZWdleHA6IFJlZ0V4cH0+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmVzdWx0c1dpdGhSZWdFeHAocmVzdWx0cykge1xyXG4gICAgY29uc3QgbWFwID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgY2xzIGluIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAocmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShjbHMpKSB7XHJcbiAgICAgICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNscyxcclxuICAgICAgICAgICAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChyZXN1bHRzW2Nsc10pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFwO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBvYmplY3Qgd2l0aCBwcmVmaXhlZCBjbGFzc2VzIGJhc2VkIG9uIHNldHRpbmdzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5nc1xyXG4gKiBAcmV0dXJucyB7e319XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9QcmVmaXhlZENsYXNzZXMoc2V0dGluZ3MpIHtcclxuICAgIGxldCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBDTEFTU0VTX1RPX0JFX1BSRUZJWEVELmZvckVhY2goKGNscykgPT4ge1xyXG4gICAgICAgIHJlc3VsdFtjbHNdID0gc2V0dGluZ3MucHJlZml4Q2xzICsgc2V0dGluZ3NbY2xzXTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgdGhlIGVsZW1lbnQgZm9yIDMgYXR0cmlidXRlcyBhbmQgcmV0dXJucyBvYmplY3Qgd2l0aCBzZXQgYXBwcm9wcmlhdGVcclxuICogdmFsdWVzXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NKHRhYmxlKSB7XHJcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUExBQ0VfQ09MVU1OKSkge1xyXG4gICAgICAgIG91dHB1dC5wbGFjZUNvbHVtbiA9IE51bWJlcih0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19QTEFDRV9DT0xVTU4pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfU1RBUlRJTkdfUk9XKSkge1xyXG4gICAgICAgIG91dHB1dC5zdGFydGluZ1JvdyA9IE51bWJlcih0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19TVEFSVElOR19ST1cpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUk9VTkRTX0NPTFVNTlMpKSB7XHJcbiAgICAgICAgb3V0cHV0LnJvdW5kc0NvbHVtbnMgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19ST1VORFNfQ09MVU1OUyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0NMSUNLSU5HKSkge1xyXG4gICAgICAgIG91dHB1dC5jbGlja2luZyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0NMSUNLSU5HKSAhPT0gJ2ZhbHNlJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfSE9WRVJJTkcpKSB7XHJcbiAgICAgICAgb3V0cHV0LmhvdmVyaW5nID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfSE9WRVJJTkcpICE9PSAnZmFsc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBhcnJheS1saWtlIG9iamVjdHMgKHN1Y2ggYXMgYXJndW1lbnRzIG9yIG5vZGUgbGlzdHMpIGludG8gYW4gYXJyYXlcclxuICogQHBhcmFtIHsqfSBhcnJheUxpa2VcclxuICogQHJldHVybnMge0FycmF5LjxUPn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhc0FycmF5KGFycmF5TGlrZSkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycmF5TGlrZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG5ldyBvYmplY3QgY29udGFpbmluZyBrZXlzIG9ubHkgZnJvbSBkZWZhdWx0T2JqIGJ1dCB2YWx1ZXMgYXJlIHRha2VuXHJcbiAqIGZyb20gaWYgZXhpc3QgKHN0YXJ0aW5nIGZyb20gdGhlIGxhc3Qgb2JqZWN0IHByb3ZpZGVkKVxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGVmYXVsdE9ialxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSAuLi5vYmplY3RzXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoZGVmYXVsdE9iaiwgLi4ub2JqZWN0cykge1xyXG4gICAgY29uc3Qgb3ZlcnJpZGVzID0gb2JqZWN0c1xyXG4gICAgICAgIC5maWx0ZXIoKG9iaikgPT4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgLnJldmVyc2UoKTtcclxuXHJcbiAgICBjb25zdCBjb3VudCA9IG92ZXJyaWRlcy5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBtYWluTG9vcDogZm9yIChsZXQga2V5IGluIGRlZmF1bHRPYmopIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKG92ZXJyaWRlc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG92ZXJyaWRlc1tpXVtrZXldO1xyXG4gICAgICAgICAgICAgICAgY29udGludWUgbWFpbkxvb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3VsdFtrZXldID0gZGVmYXVsdE9ialtrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG5ldyBvYmplY3QgdGhhdCBoYXMgbWVyZ2VkIHByb3BlcnRpZXMgZnJvbSBhbGwgcHJvdmlkZWQgb2JqZWN0cy5cclxuICogTGF0ZXN0IGFyZ3VtZW50cyBvdmVycmlkZXMgdGhlIGVhcmxpZXIgdmFsdWVzLlxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBvYmplY3RzXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSguLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBvYmplY3RzLmZvckVhY2goKG9iamVjdCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufSJdfQ==
(1)
});
