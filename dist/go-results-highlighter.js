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

        this.current = null;
        this.isShowingDetails = false;
        this.isHighlighting = false;
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

                this.current = playerPlace;
                this.isHighlighting = true;
            } else {
                this.current = null;
                this.isHighlighting = false;
            }
        }

        /**
         * Binds touchend, click, mouseover and mouseout events listeners to the element.
         */

    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this2 = this;

            this.element.addEventListener('touchend', function (event) {
                if (_this2.settings.clicking === false && _this2.settings.hovering === false) {
                    return;
                }

                var _fetchInformationAbou = fetchInformationAboutTarget(event.target);

                var target = _fetchInformationAbou.target;
                var player = _fetchInformationAbou.player;
                var opponent = _fetchInformationAbou.opponent;

                if (!player) {
                    return;
                }

                var compact = false;
                var lastTargetPos = undefined;

                if (_this2.current === player) {
                    if (!_this2.settings.clicking || !_this2.settings.hovering) {
                        player = null;
                    }
                    compact = !_this2.isShowingDetails;
                } else if (_this2.isShowingDetails || !_this2.settings.hovering) {
                    compact = true;
                }

                if (compact) {
                    lastTargetPos = target.getBoundingClientRect().top;
                }

                _this2.highlight({ player: player, opponent: opponent, compact: compact });

                if (lastTargetPos) {
                    var diff = target.getBoundingClientRect().top - lastTargetPos;

                    if (Math.abs(diff) > 10) {
                        window.scrollBy(0, diff);
                    }
                }

                event.preventDefault();
            });

            this.element.addEventListener('click', function (event) {
                if (_this2.settings.clicking === false) {
                    return;
                }

                var _fetchInformationAbou2 = fetchInformationAboutTarget(event.target);

                var target = _fetchInformationAbou2.target;
                var player = _fetchInformationAbou2.player;
                var opponent = _fetchInformationAbou2.opponent;

                var compact = false;
                var lastTargetPos = undefined;

                if (!player) {
                    return;
                }

                if (!_this2.isShowingDetails || target.properNextSibling) {
                    compact = true;
                } else if (!_this2.settings.hovering) {
                    player = null;
                }

                if (compact) {
                    lastTargetPos = target.getBoundingClientRect().top;
                }

                _this2.highlight({ player: player, opponent: opponent, compact: compact });

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

                var _fetchInformationAbou3 = fetchInformationAboutTarget(event.target);

                var player = _fetchInformationAbou3.player;
                var opponent = _fetchInformationAbou3.opponent;

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
                    _this2.highlight(false);
                }
            }, false);
        }
    }]);

    return GoResultsHighlighter;
})();

/**
 * Retrieves information about player and opponent placement from provided element
 * or its parents. Returns also the row with player placement information.
 * @param {HTMLElement} target - target of the event
 * @returns {object}
 */

exports.default = GoResultsHighlighter;
function fetchInformationAboutTarget(target) {
    var result = {
        player: null,
        opponent: null,
        target: null
    };

    // fetch information about hovered element
    while (target && target !== document) {
        var opponentGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT);
        var playerGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT);

        // game cell?
        if (opponentGridPlacement) {
            result.opponent = Number(opponentGridPlacement);
        }

        // player row? no further search is necessary
        if (playerGridPlacement) {
            result.player = Number(playerGridPlacement);
            break;
        }

        target = target.parentNode;
    }

    result.target = target;

    return result;
}

/**
 * Restores default order of rows in the table
 * @param {Array.<object>} players - list of mapping data for all rows
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImZha2VfMzMwMDE4MDYuanMiLCJoaWdobGlnaHRlci5qcyIsInBhcnNlci5qcyIsInJhdzJ0YWJsZS5qcyIsInNldHRpbmdzLmpzIiwidXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNYixTQUFTLFVBQVUsR0FBRztBQUNsQixlQUhLLE9BQU8sRUFHSixRQUFRLENBQUMsZ0JBQWdCLE9BQUssVUFKakMsY0FBYyxDQUlrQyxZQUFZLE9BQUksQ0FBQyxDQUNqRSxPQUFPLENBQUMsVUFBQyxPQUFPO2VBQUssMEJBQXlCLE9BQU8sQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNoRTs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOztBQUVELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQy9CLFVBQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDaEQsWUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDaEMsZ0JBQUksV0FBVyxHQUFHLDBCQUF5QixPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTdELGFBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3BFLENBQUMsQ0FBQztBQUNILGVBQU8sSUFBSSxDQUFDO0tB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Q0FBQzs7QUFFbEIsWUFBUSxFQUFFLEtBQUssSUFBSSxHQUFHLElBQUksVUFBVSxFQUFFO0FBQ2xDLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsZ0JBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNsQyxzQkFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyx5QkFBUyxRQUFRLENBQUM7YUFDckI7U0FDSjs7QUFFRCxjQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pDOztBQUVELFdBQU8sTUFBTSxDQUFDO0NBQ2pCOzs7Ozs7OztBQUFBLEFBUU0sU0FBUyxPQUFPLEdBQWE7QUFDaEMsUUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDOzt1Q0FESyxPQUFPO0FBQVAsZUFBTzs7O0FBRzlCLFdBQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDeEIsYUFBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUU7QUFDcEIsZ0JBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1QixzQkFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM3QjtTQUNKO0tBQ0osQ0FBQyxDQUFDOztBQUVILFdBQU8sTUFBTSxDQUFDO0NBQ2pCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBHb1Jlc3VsdHNIaWdobGlnaHRlciBmcm9tICcuL2xpYi9oaWdobGlnaHRlcic7XHJcbmltcG9ydCB7IERPTV9BVFRSSUJVVEVTIH0gZnJvbSAnLi9saWIvc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBhc0FycmF5IH0gZnJvbSAnLi9saWIvdXRpbHMnO1xyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgIGFzQXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgWyR7RE9NX0FUVFJJQlVURVMuUkVTVUxUX1RBQkxFfV1gKSlcclxuICAgICAgICAuZm9yRWFjaCgodGFibGVFbCkgPT4gbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKHRhYmxlRWwpKTtcclxufVxyXG5cclxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgIGluaXRpYWxpemUoKTtcclxufSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0aWFsaXplLCBmYWxzZSk7XHJcbn1cclxuXHJcbmlmICh0eXBlb2YgalF1ZXJ5ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgalF1ZXJ5LmZuLmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlciA9IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcihlbGVtZW50LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgICQoaGlnaGxpZ2h0ZXIuZWxlbWVudCkuZGF0YSgnR29SZXN1bHRzSGlnaGxpZ2h0ZXInLCBoaWdobGlnaHRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9QcmVmaXhlZENsYXNzZXMsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTSB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wYXJzZXInO1xyXG5pbXBvcnQgY29udmVydCBmcm9tICcuL3JhdzJ0YWJsZSc7XHJcbmltcG9ydCB7IGFzQXJyYXksIGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb1Jlc3VsdHNIaWdobGlnaHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBHb1Jlc3VsdHNIaWdobGlnaHRlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBtYWluIGVsZW1lbnQgY29udGFpbmluZyB0YWJsZSB3aXRoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIC0gcGx1Z2luIHNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLmNvbHVtbj0wXSAtIGluZGV4IG9mIHRoZSBjb2x1bW5cclxuICAgICAqIHdoZXJlIHRoZSBzY3JpcHQgc2hvdWxkIGV4cGVjdCB0byBmaW5kIHBsYXllcidzIHBsYWNlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5yb3c9MF0gLSBzdGFydGluZyByb3cgd2l0aCBwbGF5ZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnByZWZpeENscz0nZ28tcmVzdWx0cy0nXSAtIGNzcyBjbGFzcyBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuZ2FtZUNscz0nZ2FtZSddIC0gZ2FtZSBjZWxsIGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY3VycmVudENscz0nY3VycmVudCddIC0gc2VsZWN0ZWQgcm93IGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3MucmVzdWx0c10gLSBtYXAgd2l0aCBwb3NzaWJsZSByZXN1bHRzLCBieSBkZWZhdWx0XHJcbiAgICAgKiBzdXBwb3J0cyA0IG9wdGlvbnMuIFByb3ZpZGUgd2l0aCBcImNsYXNzTmFtZVwiIC0+IFwicmVnZXhwXCIgcGF0dGVybi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy53b249JyhbMC05XSspXFxcXCsnXSAtIGRlZmF1bHQgd2lubmluZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5sb3N0PScoWzAtOV0rKVxcXFwtJ10gLSBkZWZhdWx0IGxvc2luZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5qaWdvPScoWzAtOV0rKT0nXSAtIGRlZmF1bHQgZHJhdyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy51bnJlc29sdmVkPScoWzAtOV0rKVxcXFw/XSAtIGRlZmF1bHQgdW5yZXNvbHZlZCByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFncz0ndHInXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGUgc3RyaW5nXHJcbiAgICAgKiB3aXRoIHRhZ3MgcmVwcmVzZW50aW5nIHBsYXllcnMnIHJvd3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY2VsbFRhZ3M9J3RkLHRoJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlXHJcbiAgICAgKiBzdHJpbmcgd2l0aCB0YWdzIGhvbGRpbmcgZ2FtZSByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTShlbGVtZW50KSwgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxQcmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9IGNvbnZlcnQoZWxlbWVudC5pbm5lckhUTUwsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGFibGUsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0YWJsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgIC8vIG5vdCBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzTWFwKCk7XHJcbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy50YWJsZUNscyk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzU2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIHBsYXllcnMgbWFwXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVBsYXllcnNNYXAoKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBwYXJzZSh0aGlzLmVsZW1lbnQsIHRoaXMuc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwbGFjZW1lbnQgaW4gdGhpcy5tYXApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KHBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKHRoaXMubWFwW3BsYWNlbWVudF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgcGxheWVyIGFuZCBoaXMgb3Bwb25lbnRzIGhpZ2hsaWdodGVkLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R8bnVtYmVyfG51bGx9IFtzZXR0aW5nc10gLSBoaWdobGlnaHRpbmcgc2V0dGluZ3Mgb3IgcGxheWVyIHRvIGJlIGhpZ2hsaWdodGVkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLnBsYXllcl0gLSBwbGF5ZXIgd2hvc2Ugb3Bwb25lbnRzIHNob3VsZCBiZVxyXG4gICAgICogaGlnaGxpZ2h0ZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NldHRpbmdzLmNvbXBhY3Q9ZmFsc2VdIC0gd2hldGhlciB0aGUgdGFibGUgc2hvdWxkIGJlXHJcbiAgICAgKiByZWFycmFuZ2VkIHRvIGRpc3BsYXkgcmVzdWx0cyBpbiBjb21wYWN0IHNpemVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3Mub3Bwb25lbnRdIC0gdGhlIG9wcG9uZW50IHdob3NlIGdhbWUgd2l0aCB0aGVcclxuICAgICAqIHBsYXllciBzaG91bGQgYmUgaGlnaGxpZ2h0ZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbXBhY3Q9ZmFsc2VdIC0gaWYgc2V0dGluZ3MgYXJlIG5vdCBwcm92aWRlZCB0aGFuIHRoaXNcclxuICAgICAqIGFyZ3VtZW50IGlzIGNoZWNrZWQgZm9yIGNvbXBhY3QgZmxhZ1xyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoc2V0dGluZ3MsIGNvbXBhY3QgPSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBwbGF5ZXJQbGFjZTtcclxuICAgICAgICBsZXQgZ2FtZVdpdGhPcHBvbmVudDtcclxuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzICYmIHR5cGVvZiBzZXR0aW5ncyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcGxheWVyUGxhY2UgPSBzZXR0aW5ncy5wbGF5ZXI7XHJcbiAgICAgICAgICAgIGNvbXBhY3QgPSBzZXR0aW5ncy5jb21wYWN0ID09PSB0cnVlO1xyXG4gICAgICAgICAgICBnYW1lV2l0aE9wcG9uZW50ID0gc2V0dGluZ3Mub3Bwb25lbnQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGxheWVyUGxhY2UgPSBzZXR0aW5ncztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuICAgICAgICBjb25zdCBjbGFzc2VzID0gdG9QcmVmaXhlZENsYXNzZXModGhpcy5zZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIGlmIHRhYmxlIGlzIGFscmVhZHkgcmVhcnJhbmdlZCB0aGVuIHRyYW5zZm9ybSBpdCBiYWNrIHRvIGRlZmF1bHQgc3RhdGVcclxuICAgICAgICBpZiAodGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgIHJlc3RvcmVOYXR1cmFsT3JkZXIodGhpcy5wbGF5ZXJzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlYXJyYW5nZSB0aGUgdGFibGUgaWYgcGxheWVyIGFuZCBhcHByb3ByaWF0ZSBzZXR0aW5nIGlzIHByb3ZpZGVkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBjb21wYWN0KSB7XHJcbiAgICAgICAgICAgIHJlYXJyYW5nZU9yZGVyKHBsYXllciwgcGxheWVyLm9wcG9uZW50cy5tYXAoKG9wcG9uZW50UGxhY2UpID0+IHRoaXMubWFwW29wcG9uZW50UGxhY2VdKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc2VzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5pc1Nob3dpbmdEZXRhaWxzID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5pc1Nob3dpbmdEZXRhaWxzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBtYXJrZWRHYW1lcyA9IGFzQXJyYXkodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgY2xhc3Nlcy5nYW1lQ2xzKSk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgY2xhc3Nlcy5jdXJyZW50Q2xzKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3dQbGFjZW1lbnQgPSBtYXJrZWRSb3cgPyBtYXJrZWRSb3cuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpIDogbnVsbDtcclxuICAgICAgICBjb25zdCBtYXJrZWRQbGF5ZXIgPSBtYXJrZWRSb3dQbGFjZW1lbnQgPyB0aGlzLm1hcFttYXJrZWRSb3dQbGFjZW1lbnRdIDogbnVsbDtcclxuICAgICAgICBjb25zdCBtYXJrID0gKHBsYXllciwgYWN0aXZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IGFjdGl2ZSA/ICdhZGQnIDogJ3JlbW92ZSc7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIucm93LmNsYXNzTGlzdFttZXRob2RdKGNsYXNzZXMuY3VycmVudENscyk7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50UGxhY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3RbbWV0aG9kXSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jbHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgYW55IHZpc2libGUgZ2FtZSBtYXJraW5nc1xyXG4gICAgICAgIG1hcmtlZEdhbWVzLmZvckVhY2goKGdhbWVDZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGdhbWVDZWxsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5nYW1lQ2xzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdW5tYXJrIHBsYXllciBpZiBuZWNlc3NhcnlcclxuICAgICAgICBpZiAobWFya2VkUGxheWVyICYmIG1hcmtlZFBsYXllciAhPT0gcGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsobWFya2VkUGxheWVyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBwbGF5ZXIgaWYgbm90IGFscmVhZHkgbWFya2VkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBwbGF5ZXIgIT09IG1hcmtlZFBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrKHBsYXllciwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGxheWVyKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lV2l0aE9wcG9uZW50ICYmIHRoaXMubWFwW2dhbWVXaXRoT3Bwb25lbnRdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2FtZSA9IHBsYXllci5nYW1lc1tnYW1lV2l0aE9wcG9uZW50XTtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW2dhbWVXaXRoT3Bwb25lbnRdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChnYW1lICYmIG9wcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS5jZWxsLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5nYW1lQ2xzKTtcclxuICAgICAgICAgICAgICAgICAgICBvcHBvbmVudC5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRdLmdhbWVzW3BsYXllclBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5nYW1lQ2xzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gcGxheWVyUGxhY2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRpbmcgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuaXNIaWdobGlnaHRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyB0b3VjaGVuZCwgY2xpY2ssIG1vdXNlb3ZlciBhbmQgbW91c2VvdXQgZXZlbnRzIGxpc3RlbmVycyB0byB0aGUgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgYmluZEV2ZW50cygpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSAmJiB0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeyB0YXJnZXQsIHBsYXllciwgb3Bwb25lbnQgfSA9IGZldGNoSW5mb3JtYXRpb25BYm91dFRhcmdldChldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvbXBhY3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IGxhc3RUYXJnZXRQb3M7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50ID09PSBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5jbGlja2luZyB8fCAhdGhpcy5zZXR0aW5ncy5ob3ZlcmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb21wYWN0ID0gIXRoaXMuaXNTaG93aW5nRGV0YWlscztcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1Nob3dpbmdEZXRhaWxzIHx8ICF0aGlzLnNldHRpbmdzLmhvdmVyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wYWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbXBhY3QpIHtcclxuICAgICAgICAgICAgICAgIGxhc3RUYXJnZXRQb3MgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodCh7IHBsYXllciwgb3Bwb25lbnQsIGNvbXBhY3QgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobGFzdFRhcmdldFBvcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCBkaWZmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeyB0YXJnZXQsIHBsYXllciwgb3Bwb25lbnQgfSA9IGZldGNoSW5mb3JtYXRpb25BYm91dFRhcmdldChldmVudC50YXJnZXQpO1xyXG4gICAgICAgICAgICBsZXQgY29tcGFjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1Nob3dpbmdEZXRhaWxzIHx8IHRhcmdldC5wcm9wZXJOZXh0U2libGluZykge1xyXG4gICAgICAgICAgICAgICAgY29tcGFjdCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNldHRpbmdzLmhvdmVyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tcGFjdCkge1xyXG4gICAgICAgICAgICAgICAgbGFzdFRhcmdldFBvcyA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHsgcGxheWVyLCBvcHBvbmVudCwgY29tcGFjdCB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYXN0VGFyZ2V0UG9zKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSBsYXN0VGFyZ2V0UG9zO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkaWZmKSA+IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbEJ5KDAsIGRpZmYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaG92ZXJpbmcgPT09IGZhbHNlIHx8IHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeyBwbGF5ZXIsIG9wcG9uZW50IH0gPSBmZXRjaEluZm9ybWF0aW9uQWJvdXRUYXJnZXQoZXZlbnQudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHsgcGxheWVyLCBvcHBvbmVudCB9KTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50ICYmIHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgbmV3IGhvdmVyZWQgZWxlbWVudCBpcyBvdXRzaWRlIHRoZSB0YWJsZSB0aGVuIHJlbW92ZSBhbGxcclxuICAgICAgICAgICAgLy8gc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHJpZXZlcyBpbmZvcm1hdGlvbiBhYm91dCBwbGF5ZXIgYW5kIG9wcG9uZW50IHBsYWNlbWVudCBmcm9tIHByb3ZpZGVkIGVsZW1lbnRcclxuICogb3IgaXRzIHBhcmVudHMuIFJldHVybnMgYWxzbyB0aGUgcm93IHdpdGggcGxheWVyIHBsYWNlbWVudCBpbmZvcm1hdGlvbi5cclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gdGFyZ2V0IG9mIHRoZSBldmVudFxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZnVuY3Rpb24gZmV0Y2hJbmZvcm1hdGlvbkFib3V0VGFyZ2V0KHRhcmdldCkge1xyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICBwbGF5ZXI6IG51bGwsXHJcbiAgICAgICAgb3Bwb25lbnQ6IG51bGwsXHJcbiAgICAgICAgdGFyZ2V0OiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgbGV0IG9wcG9uZW50R3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKTtcclxuICAgICAgICBsZXQgcGxheWVyR3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUgY2VsbD9cclxuICAgICAgICBpZiAob3Bwb25lbnRHcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5vcHBvbmVudCA9IE51bWJlcihvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcGxheWVyIHJvdz8gbm8gZnVydGhlciBzZWFyY2ggaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKHBsYXllckdyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnBsYXllciA9IE51bWJlcihwbGF5ZXJHcmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICByZXN1bHQudGFyZ2V0ID0gdGFyZ2V0O1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXN0b3JlcyBkZWZhdWx0IG9yZGVyIG9mIHJvd3MgaW4gdGhlIHRhYmxlXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IHBsYXllcnMgLSBsaXN0IG9mIG1hcHBpbmcgZGF0YSBmb3IgYWxsIHJvd3NcclxuICovXHJcbmZ1bmN0aW9uIHJlc3RvcmVOYXR1cmFsT3JkZXIocGxheWVycykge1xyXG4gICAgcGxheWVyc1xyXG4gICAgICAgIC5maWx0ZXIoKHBsYXllcikgPT4gcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZylcclxuICAgICAgICAucmV2ZXJzZSgpXHJcbiAgICAgICAgLmZvckVhY2goKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3cucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChwbGF5ZXIucm93KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3cucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGxheWVyLnJvdywgcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG51bGw7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWFycmFuZ2VzIHRoZSByb3dzIGluIGEgdGFibGVcclxuICogQHBhcmFtIHtvYmplY3R9IHBsYXllciAtIHBsYXllciBtYXBwaW5nIGRhdGFcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb3Bwb25lbnRzIC0gbGlzdCBvZiBvcHBvbmVudHMgbWFwcGluZyBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiByZWFycmFuZ2VPcmRlcihwbGF5ZXIsIG9wcG9uZW50cykge1xyXG4gICAgY29uc3QgcGFyZW50ID0gcGxheWVyLnJvdy5wYXJlbnROb2RlO1xyXG4gICAgbGV0IGFmdGVyID0gcGxheWVyLnJvdy5uZXh0RWxlbWVudFNpYmxpbmc7XHJcblxyXG4gICAgb3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50KSA9PiB7XHJcbiAgICAgICAgb3Bwb25lbnQucm93LnByb3Blck5leHRTaWJsaW5nID0gb3Bwb25lbnQucm93Lm5leHRFbGVtZW50U2libGluZyB8fCAtMTtcclxuXHJcbiAgICAgICAgaWYgKG9wcG9uZW50LnRvdXJuYW1lbnRQbGFjZSA8IHBsYXllci50b3VybmFtZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShvcHBvbmVudC5yb3csIHBsYXllci5yb3cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUob3Bwb25lbnQucm93LCBhZnRlcik7XHJcbiAgICAgICAgICAgIGFmdGVyID0gb3Bwb25lbnQucm93Lm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuR29SZXN1bHRzSGlnaGxpZ2h0ZXIuREVGQVVMVF9TRVRUSU5HUyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IGFzQXJyYXksIGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1Jlc3VsdHNXaXRoUmVnRXhwIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcblxyXG5mdW5jdGlvbiB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBwbGFjZW1lbnQpIHtcclxuICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgcGxhY2VtZW50KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYXZlcnNlIHByb3ZpZGVkIHRhYmxlIGFuZCBjcmVhdGUgcmVzdWx0cyBtYXBcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGUgLSB0YWJsZSByZXN1bHRzIGNvbnRhaW5lclxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZ10gLSBzZXR0aW5ncyBmb3IgcGFyc2VyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnJvd1RhZ3NdXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLmNlbGxUYWdzXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5yZXN1bHRzXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5wbGFjZUNvbHVtbl1cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucm91bmRzQ29sdW1uc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcuc3RhcnRpbmdSb3ddXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZSh0YWJsZSwgY29uZmlnKSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIGNvbmZpZyk7XHJcbiAgICBjb25zdCByb3dzID0gYXNBcnJheSh0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLnJvd1RhZ3MpKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSB0b1Jlc3VsdHNXaXRoUmVnRXhwKHNldHRpbmdzLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcENvdW50ID0gcmVzdWx0c01hcC5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHRzID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyc2VHYW1lcyhwbGF5ZXIsIGNlbGxzKSB7XHJcbiAgICAgICAgLy8gaWYgY29sdW1ucyByb3VuZHMgYXJlIHByb3ZpZGVkIHRoZW4gcGFyc2Ugb25seSB0aGVtXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBjZWxscyA9IHNldHRpbmdzLnJvdW5kc0NvbHVtbnNcclxuICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpXHJcbiAgICAgICAgICAgICAgICAubWFwKChyb3VuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjZWxsc1tOdW1iZXIocm91bmQpXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnRQbGFjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdENscztcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAoY2VsbC5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQpICYmIGNlbGwuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCkpIHtcclxuICAgICAgICAgICAgICAgIG9wcG9uZW50UGxhY2UgPSBOdW1iZXIoY2VsbC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRDbHMgPSBjZWxsLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzTWFwQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGwudGV4dENvbnRlbnQubWF0Y2gocmVzdWx0c01hcFtpXS5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnRQbGFjZSA9IE51bWJlcihtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Q2xzID0gcmVzdWx0c01hcFtpXS5jbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCwgb3Bwb25lbnRQbGFjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQsIHJlc3VsdHNNYXBbaV0uY2xzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXSA9IHtcclxuICAgICAgICAgICAgICAgIGNlbGwsXHJcbiAgICAgICAgICAgICAgICBjbHM6IHJlc3VsdENsc1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5wdXNoKG9wcG9uZW50UGxhY2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgIGxldCBsYXN0R3JpZFBsYWNlbWVudDtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcclxuICAgICAgICBpZiAoaW5kZXggPCBzZXR0aW5ncy5zdGFydGluZ1Jvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZWxscyA9IGFzQXJyYXkocm93LnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3MuY2VsbFRhZ3MpKTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHQgcGxhY2VcclxuICAgICAgICBsZXQgZ3JpZFBsYWNlbWVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLyBubyBjZWxscz8gdW5saWtlbHkgdG8gYmUgYSByZXN1bHQgcm93XHJcbiAgICAgICAgaWYgKCFjZWxscy5sZW5ndGggfHwgIWNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXSkge1xyXG4gICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBwYXJzZUludChjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0udGV4dENvbnRlbnQsIDEwKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0ge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2U6IC0xLFxyXG4gICAgICAgICAgICByb3csXHJcbiAgICAgICAgICAgIGdhbWVzOiB7fSxcclxuICAgICAgICAgICAgb3Bwb25lbnRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChyb3cuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpKSB7XHJcbiAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBOdW1iZXIocm93LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgICAgIGlmICghbGFzdEdyaWRQbGFjZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtb3N0IHByb2JhYmx5IG5vdCBhIHJlc3VsdCByb3dcclxuICAgICAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhc3NpZ24gdG91cm5hbWVudCBpZiBkZWZpbmVkIChwb3NzaWJseSBzaG93aW5nIGFuIGV4dHJhY3QgZnJvbSBncmVhdGVyIHRhYmxlKVxyXG4gICAgICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQgfHwgMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBsYXN0R3JpZFBsYWNlbWVudCArIDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFzc3VtcHRpb246IGlmIHBsYWNlIGlzIG5vdCBwcm92aWRlZCB0aGVuIGl0J3MgYW4gZXggYWVxdW8gY2FzZSBidXRcclxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgYSBsb3dlciBwbGFjZSBub25ldGhlbGVzc1xyXG4gICAgICAgICAgICBpZiAoIXRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA/IGxhc3RUb3VybmFtZW50UGxhY2VtZW50IDogMTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG91cm5hbWVudFBsYWNlbWVudCA8PSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChncmlkUGxhY2VtZW50ID09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcnNlR2FtZXMocGxheWVyLCBjZWxscyk7XHJcblxyXG4gICAgICAgIHBsYXllci50b3VybmFtZW50UGxhY2UgPSB0b3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIHBsYXllci5vcHBvbmVudHMuc29ydCgoYSwgYikgPT4gYSA+IGIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICByZXN1bHRzW2dyaWRQbGFjZW1lbnRdID0gcGxheWVyO1xyXG5cclxuICAgICAgICBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgbGFzdEdyaWRQbGFjZW1lbnQgPSBncmlkUGxhY2VtZW50O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9SZXN1bHRzV2l0aFJlZ0V4cCB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIHJhdyByZXN1bHRzIHN0cmluZyBpbnRvIHRhYmxlIHdpdGggcm93cyBhbmQgY2VsbHMuXHJcbiAqIFJldHVybnMgbnVsbCBpZiBub3QgdmFsaWQgaW5wdXQuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByYXdSZXN1bHRzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnXVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5zdGFydGluZ1Jvdz0wXSAtIGluZm9ybXMgd2hlcmUgaXMgdGhlIGZpcnN0IHJvdyB3aXRoIHJlc3VsdHNcclxuICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcucGxhY2VDb2x1bW49MF0gLSBpbmZvcm1zIGluIHdoaWNoIGNvbHVtbiBpcyB0aGUgcGxhY2UgbG9jYXRlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yb3VuZHNDb2x1bW5zXSAtIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNvbHVtbnMgd2hlcmUgZ2FtZSByZXN1bHRzIGFyZSBsb2NhdGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLmNlbGxTZXBhcmF0b3I9J1tcXHQgXSsnXSAtIHNlcGFyYXRlZCB1c2VkIHRvIGRpdmlkZSByb3dzIGludG8gY2VsbHNcclxuICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLmpvaW5OYW1lcz10cnVlXSAtIGpvaW5zIHR3byBjb25zZWN1dGl2ZSBjZWxscyBhZnRlciB0aGUgcGxhY2UgY29sdW1uIGludG8gb25lIGNlbGxcclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb252ZXJ0UmF3UmVzdWx0c1RvVGFibGUocmF3UmVzdWx0cywgY29uZmlnKSB7XHJcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG5cclxuICAgIGlmICghcmF3UmVzdWx0cykge1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCBjb25maWcpO1xyXG4gICAgY29uc3QgbGluZXMgPSByYXdSZXN1bHRzLnNwbGl0KC9cXHJcXG58XFxuLyk7XHJcblxyXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA8PSAyICYmICFsaW5lc1swXSAmJiAhbGluZXNbMV0pIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSB0b1Jlc3VsdHNXaXRoUmVnRXhwKHNldHRpbmdzLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcENvdW50ID0gcmVzdWx0c01hcC5sZW5ndGg7XHJcblxyXG4gICAgY29uc3Qgcm93cyA9IGxpbmVzXHJcbiAgICAgICAgLm1hcCgobGluZSkgPT4gbGluZVxyXG5cclxuICAgICAgICAgICAgLy8gcHJvYmFibHkgdW5oZWFsdGh5IHJlcGxhY2luZyBzcGFjZSBpbiByYW5rIGluIG9yZGVyIHRvIG1ha2Ugc3VyZVxyXG4gICAgICAgICAgICAvLyB0aGF0IGl0IHdvbid0IGJlIGJyb2tlbiBpbnRvIHR3byBjZWxsc1xyXG4gICAgICAgICAgICAucmVwbGFjZSgvKFswLTldKylcXHMoZGFufGt5dSkvaSwgJyQxXyQyJylcclxuXHJcbiAgICAgICAgICAgIC8vIHNwbGl0IGxpbmUgdG8gY2VsbHMgKGNvbnNpZGVyIHRhYnMgYW5kIHNwYWNlcyBhcyBzZXBhcmF0b3JzIGJ5IGRlZmF1bHQpXHJcbiAgICAgICAgICAgIC5zcGxpdChuZXcgUmVnRXhwKHNldHRpbmdzLmNlbGxTZXBhcmF0b3IpKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGVtcHR5IGNlbGxzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGNlbGwpID0+IGNlbGwubGVuZ3RoID4gMClcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIC8vIGZpbHRlciBvdXQgZW1wdHkgcm93cyBvciByb3dzIHN0YXJ0aW5nIHdpdGggJzsnIChFR0QvRkZHIGNvbW1lbnQpXHJcbiAgICAgICAgLmZpbHRlcigoY2VsbHMpID0+IGNlbGxzLmxlbmd0aCA+IDAgJiYgY2VsbHNbMF0uaW5kZXhPZignOycpICE9PSAwKTtcclxuXHJcbiAgICBjb25zdCB0YWJsZVdpZHRoID0gcm93cy5yZWR1Y2UoKHByZXYsIGxpbmUpID0+IE1hdGgubWF4KHByZXYsIGxpbmUubGVuZ3RoKSwgMCk7XHJcbiAgICBjb25zdCB0YWJsZU1vZGlmaWVyID0gc2V0dGluZ3Muam9pbk5hbWVzID8gLTEgOiAwO1xyXG4gICAgY29uc3Qgam9pbk5hbWVQb3MgPSBzZXR0aW5ncy5wbGFjZUNvbHVtbiArIDE7XHJcblxyXG4gICAgbGV0IGdhbWVzSW5Db2x1bW5zID0gbnVsbDtcclxuXHJcbiAgICAvLyBpZiBjb2x1bW5zIHJvdW5kcyBhcmUgcHJvdmlkZWQgdGhlbiBjb252ZXJ0IG9ubHkgdGhlbVxyXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGdhbWVzSW5Db2x1bW5zID0gc2V0dGluZ3Mucm91bmRzQ29sdW1ucy5zcGxpdCgnLCcpLm1hcChOdW1iZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwcmV2aW91c1BsYWNlO1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgoY2VsbHMsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IGNlbGxzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKCF3aWR0aCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5kZXggPCBzZXR0aW5ncy5zdGFydGluZ1JvdyB8fCB3aWR0aCA8ICh0YWJsZVdpZHRoICsgdGFibGVNb2RpZmllcikpIHtcclxuICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2NvbHNwYW4nLCB0YWJsZVdpZHRoICsgdGFibGVNb2RpZmllcik7XHJcbiAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxscy5qb2luKCcgJyk7XHJcblxyXG4gICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIC0xKTtcclxuICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcGxhY2UgPSBwYXJzZUludChjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0sIDEwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc05hTihwbGFjZSkgJiYgIXByZXZpb3VzUGxhY2UpIHtcclxuICAgICAgICAgICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGxDb250ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgcHJldmlvdXNQbGFjZSB8fCBwbGFjZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5qb2luTmFtZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxscy5zcGxpY2Uoam9pbk5hbWVQb3MsIDIsIGAke2NlbGxzW2pvaW5OYW1lUG9zXX0gICR7Y2VsbHNbam9pbk5hbWVQb3MgKyAxXX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsQ29udGVudCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxsQ29udGVudC5yZXBsYWNlKC9fLywgJyAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFnYW1lc0luQ29sdW1ucyB8fCBnYW1lc0luQ29sdW1ucy5pbmRleE9mKGluZGV4KSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGxDb250ZW50Lm1hdGNoKHJlc3VsdHNNYXBbaV0ucmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50UGxhY2VtZW50ID0gbWF0Y2hbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnRzLnB1c2gob3Bwb25lbnRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5ULCBvcHBvbmVudFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCwgcmVzdWx0c01hcFtpXS5jbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3Bwb25lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRTLCBvcHBvbmVudHMuam9pbignLCcpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZpb3VzUGxhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BsYWNlID0gMjtcclxuICAgICAgICAgICAgICAgIH0gIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUGxhY2UgKz0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dHB1dC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5SRVNVTFRfVEFCTEUsICcnKTtcclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHNldHRpbmdzIG9mIHRoZSBwbHVnaW5cclxuICogQHR5cGUge3twcmVmaXhDbHM6IHN0cmluZywgc2hvd2luZ0RldGFpbHNDbHM6IHN0cmluZywgdGFibGVDbHM6IHN0cmluZywgZ2FtZUNsczogc3RyaW5nLCBjdXJyZW50Q2xzOiBzdHJpbmcsIHJlc3VsdHM6IHt3b246IHN0cmluZywgbG9zdDogc3RyaW5nLCBqaWdvOiBzdHJpbmcsIHVucmVzb2x2ZWQ6IHN0cmluZ30sIHN0YXJ0aW5nUm93OiBudW1iZXIsIHBsYWNlQ29sdW1uOiBudW1iZXIsIHJvdW5kc0NvbHVtbnM6IG51bGwsIHJvd1RhZ3M6IHN0cmluZywgY2VsbFRhZ3M6IHN0cmluZywgcm93U2VwYXJhdG9yOiBzdHJpbmcsIGhvdmVyaW5nOiBib29sZWFuLCBjbGlja2luZzogYm9vbGVhbn19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICAgIHByZWZpeENsczogJ2dvLXJlc3VsdHMtJyxcclxuICAgIHNob3dpbmdEZXRhaWxzQ2xzOidzaG93aW5nLWRldGFpbHMnLFxyXG4gICAgdGFibGVDbHM6ICd0YWJsZScsXHJcbiAgICBnYW1lQ2xzOiAnZ2FtZScsXHJcbiAgICBjdXJyZW50Q2xzOiAnY3VycmVudCcsXHJcblxyXG4gICAgcmVzdWx0czoge1xyXG4gICAgICAgIHdvbjogJyhbMC05XSspXFxcXCsnLFxyXG4gICAgICAgIGxvc3Q6ICcoWzAtOV0rKVxcXFwtJyxcclxuICAgICAgICBqaWdvOiAnKFswLTldKyk9JyxcclxuICAgICAgICB1bnJlc29sdmVkOiAnKFswLTldKylcXFxcPydcclxuICAgIH0sXHJcblxyXG4gICAgc3RhcnRpbmdSb3c6IDAsXHJcbiAgICBwbGFjZUNvbHVtbjogMCxcclxuICAgIHJvdW5kc0NvbHVtbnM6IG51bGwsXHJcblxyXG4gICAgcm93VGFnczogJ3RyJyxcclxuICAgIGNlbGxUYWdzOiAndGQsdGgnLFxyXG4gICAgY2VsbFNlcGFyYXRvcjogJ1tcXHQgXSsnLFxyXG4gICAgam9pbk5hbWVzOiB0cnVlLFxyXG5cclxuICAgIGhvdmVyaW5nOiB0cnVlLFxyXG4gICAgY2xpY2tpbmc6IHRydWVcclxufTtcclxuXHJcbmNvbnN0IENMQVNTRVNfVE9fQkVfUFJFRklYRUQgPSBbXHJcbiAgICAnc2hvd2luZ0RldGFpbHNDbHMnLFxyXG4gICAgJ3RhYmxlQ2xzJyxcclxuICAgICdnYW1lQ2xzJyxcclxuICAgICdjdXJyZW50Q2xzJ1xyXG5dO1xyXG5cclxuLyoqXHJcbiAqIE5hbWVzIG9mIGF0dHJpYnV0ZXMgdXNlZCBpbiB0aGlzIHBsdWdpblxyXG4gKiBAdHlwZSB7e1JFU1VMVF9UQUJMRTogc3RyaW5nLCBTRVRUSU5HX1NUQVJUSU5HX1JPVzogc3RyaW5nLCBTRVRUSU5HX1BMQUNFX0NPTFVNTjogc3RyaW5nLCBTRVRUSU5HX1JPVU5EU19DT0xVTU5TOiBzdHJpbmcsIFBMQVlFUl9QTEFDRU1FTlQ6IHN0cmluZywgT1BQT05FTlRfUExBQ0VNRU5UOiBzdHJpbmcsIEdBTUVfUkVTVUxUOiBzdHJpbmd9fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERPTV9BVFRSSUJVVEVTID0ge1xyXG4gICAgUkVTVUxUX1RBQkxFOiAnZGF0YS1nby1yZXN1bHRzJyxcclxuICAgIFNFVFRJTkdfU1RBUlRJTkdfUk9XOiAnZGF0YS1nby1zdGFydGluZy1yb3cnLFxyXG4gICAgU0VUVElOR19QTEFDRV9DT0xVTU46ICdkYXRhLWdvLXBsYWNlLWNvbCcsXHJcbiAgICBTRVRUSU5HX1JPVU5EU19DT0xVTU5TOiAnZGF0YS1nby1yb3VuZHMtY29scycsXHJcbiAgICBTRVRUSU5HX0NMSUNLSU5HOiAnZGF0YS1nby1jbGlja2luZycsXHJcbiAgICBTRVRUSU5HX0hPVkVSSU5HOiAnZGF0YS1nby1ob3ZlcmluZycsXHJcbiAgICBQTEFZRVJfUExBQ0VNRU5UOiAnZGF0YS1nby1wbGFjZScsXHJcbiAgICBPUFBPTkVOVF9QTEFDRU1FTlQ6ICdkYXRhLWdvLW9wcG9uZW50JyxcclxuICAgIE9QUE9ORU5UUzogJ2RhdGEtZ28tb3Bwb25lbnRzJyxcclxuICAgIEdBTUVfUkVTVUxUOiAnZGF0YS1nby1yZXN1bHQnXHJcbn07XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBtYXAgb2YgcG9zc2libGUgcmVzdWx0cyBpbnRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCByZWdleHAgc3RyaW5nXHJcbiAqIGNvbnZlcnRlZCBpbnRvIFJlZ0V4cCBvYmplY3RzLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzdWx0c1xyXG4gKiBAcmV0dXJucyB7QXJyYXkuPHtjbHM6IHN0cmluZywgcmVnZXhwOiBSZWdFeHB9Pn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1Jlc3VsdHNXaXRoUmVnRXhwKHJlc3VsdHMpIHtcclxuICAgIGNvbnN0IG1hcCA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGNscyBpbiByZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMuaGFzT3duUHJvcGVydHkoY2xzKSkge1xyXG4gICAgICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjbHMsXHJcbiAgICAgICAgICAgICAgICByZWdleHA6IG5ldyBSZWdFeHAocmVzdWx0c1tjbHNdKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgb2JqZWN0IHdpdGggcHJlZml4ZWQgY2xhc3NlcyBiYXNlZCBvbiBzZXR0aW5nc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3NcclxuICogQHJldHVybnMge3t9fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUHJlZml4ZWRDbGFzc2VzKHNldHRpbmdzKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0ge307XHJcblxyXG4gICAgQ0xBU1NFU19UT19CRV9QUkVGSVhFRC5mb3JFYWNoKChjbHMpID0+IHtcclxuICAgICAgICByZXN1bHRbY2xzXSA9IHNldHRpbmdzLnByZWZpeENscyArIHNldHRpbmdzW2Nsc107XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHRoZSBlbGVtZW50IGZvciAzIGF0dHJpYnV0ZXMgYW5kIHJldHVybnMgb2JqZWN0IHdpdGggc2V0IGFwcHJvcHJpYXRlXHJcbiAqIHZhbHVlc1xyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTSh0YWJsZSkge1xyXG4gICAgY29uc3Qgb3V0cHV0ID0ge307XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1BMQUNFX0NPTFVNTikpIHtcclxuICAgICAgICBvdXRwdXQucGxhY2VDb2x1bW4gPSBOdW1iZXIodGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUExBQ0VfQ09MVU1OKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1NUQVJUSU5HX1JPVykpIHtcclxuICAgICAgICBvdXRwdXQuc3RhcnRpbmdSb3cgPSBOdW1iZXIodGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfU1RBUlRJTkdfUk9XKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1JPVU5EU19DT0xVTU5TKSkge1xyXG4gICAgICAgIG91dHB1dC5yb3VuZHNDb2x1bW5zID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUk9VTkRTX0NPTFVNTlMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19DTElDS0lORykpIHtcclxuICAgICAgICBvdXRwdXQuY2xpY2tpbmcgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19DTElDS0lORykgIT09ICdmYWxzZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0hPVkVSSU5HKSkge1xyXG4gICAgICAgIG91dHB1dC5ob3ZlcmluZyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0hPVkVSSU5HKSAhPT0gJ2ZhbHNlJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgYXJyYXktbGlrZSBvYmplY3RzIChzdWNoIGFzIGFyZ3VtZW50cyBvciBub2RlIGxpc3RzKSBpbnRvIGFuIGFycmF5XHJcbiAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48VD59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXNBcnJheShhcnJheUxpa2UpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IGNvbnRhaW5pbmcga2V5cyBvbmx5IGZyb20gZGVmYXVsdE9iaiBidXQgdmFsdWVzIGFyZSB0YWtlblxyXG4gKiBmcm9tIGlmIGV4aXN0IChzdGFydGluZyBmcm9tIHRoZSBsYXN0IG9iamVjdCBwcm92aWRlZClcclxuICogQHBhcmFtIHtvYmplY3R9IGRlZmF1bHRPYmpcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gLi4ub2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKGRlZmF1bHRPYmosIC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IG92ZXJyaWRlcyA9IG9iamVjdHNcclxuICAgICAgICAuZmlsdGVyKChvYmopID0+IHR5cGVvZiBvYmogPT09ICdvYmplY3QnKVxyXG4gICAgICAgIC5yZXZlcnNlKCk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBvdmVycmlkZXMubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgbWFpbkxvb3A6IGZvciAobGV0IGtleSBpbiBkZWZhdWx0T2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChvdmVycmlkZXNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvdmVycmlkZXNbaV1ba2V5XTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIG1haW5Mb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXN1bHRba2V5XSA9IGRlZmF1bHRPYmpba2V5XTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IHRoYXQgaGFzIG1lcmdlZCBwcm9wZXJ0aWVzIGZyb20gYWxsIHByb3ZpZGVkIG9iamVjdHMuXHJcbiAqIExhdGVzdCBhcmd1bWVudHMgb3ZlcnJpZGVzIHRoZSBlYXJsaWVyIHZhbHVlcy5cclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmUoLi4ub2JqZWN0cykge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgb2JqZWN0cy5mb3JFYWNoKChvYmplY3QpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn0iXX0=
(1)
});
