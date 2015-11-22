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

            var hasTouchMoved = false;

            this.element.addEventListener('touchstart', function () {
                hasTouchMoved = false;
            });

            this.element.addEventListener('touchmove', function () {
                hasTouchMoved = true;
            });

            this.element.addEventListener('touchend', function (event) {
                if (hasTouchMoved || _this2.settings.clicking === false && _this2.settings.hovering === false) {
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
                    updateTopPosition(target, lastTargetPos);
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
                    updateTopPosition(target, lastTargetPos);
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
 * Compare current target's top position with previous value and scroll window
 * to previous value if it differs
 * @param {HTMLElement} target
 * @param {number} previousTop
 */

exports.default = GoResultsHighlighter;
function updateTopPosition(target, previousTop) {
    var diff = target.getBoundingClientRect().top - previousTop;

    if (Math.abs(diff) > 10) {
        window.scrollBy(0, diff);
    }
}

/**
 * Retrieves information about player and opponent placement from provided element
 * or its parents. Returns also the row with player placement information.
 * @param {HTMLElement} target - target of the event
 * @returns {object}
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImZha2VfZmIyZjlkYzIuanMiLCJoaWdobGlnaHRlci5qcyIsInBhcnNlci5qcyIsInJhdzJ0YWJsZS5qcyIsInNldHRpbmdzLmpzIiwidXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNYixTQUFTLFVBQVUsR0FBRztBQUNsQixlQUhLLE9BQU8sRUFHSixRQUFRLENBQUMsZ0JBQWdCLE9BQUssVUFKakMsY0FBYyxDQUlrQyxZQUFZLE9BQUksQ0FBQyxDQUNqRSxPQUFPLENBQUMsVUFBQyxPQUFPO2VBQUssMEJBQXlCLE9BQU8sQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNoRTs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOztBQUVELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQy9CLFVBQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDaEQsWUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUU7QUFDaEMsZ0JBQUksV0FBVyxHQUFHLDBCQUF5QixPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRTdELGFBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3BFLENBQUMsQ0FBQztBQUNILGVBQU8sSUFBSSxDQUFDO0tB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ImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgR29SZXN1bHRzSGlnaGxpZ2h0ZXIgZnJvbSAnLi9saWIvaGlnaGxpZ2h0ZXInO1xyXG5pbXBvcnQgeyBET01fQVRUUklCVVRFUyB9IGZyb20gJy4vbGliL3NldHRpbmdzJztcclxuaW1wb3J0IHsgYXNBcnJheSB9IGZyb20gJy4vbGliL3V0aWxzJztcclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XHJcbiAgICBhc0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFske0RPTV9BVFRSSUJVVEVTLlJFU1VMVF9UQUJMRX1dYCkpXHJcbiAgICAgICAgLmZvckVhY2goKHRhYmxlRWwpID0+IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZUVsKSk7XHJcbn1cclxuXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbn0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZSwgZmFsc2UpO1xyXG59XHJcblxyXG5pZiAodHlwZW9mIGpRdWVyeSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGpRdWVyeS5mbi5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZXIgPSBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIoZWxlbWVudCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAkKGhpZ2hsaWdodGVyLmVsZW1lbnQpLmRhdGEoJ0dvUmVzdWx0c0hpZ2hsaWdodGVyJywgaGlnaGxpZ2h0ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR29SZXN1bHRzSGlnaGxpZ2h0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHRvUHJlZml4ZWRDbGFzc2VzLCByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00gfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHBhcnNlIGZyb20gJy4vcGFyc2VyJztcclxuaW1wb3J0IGNvbnZlcnQgZnJvbSAnLi9yYXcydGFibGUnO1xyXG5pbXBvcnQgeyBhc0FycmF5LCBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29SZXN1bHRzSGlnaGxpZ2h0ZXIge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgR29SZXN1bHRzSGlnaGxpZ2h0ZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gbWFpbiBlbGVtZW50IGNvbnRhaW5pbmcgdGFibGUgd2l0aCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzXSAtIHBsdWdpbiBzZXR0aW5nc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5jb2x1bW49MF0gLSBpbmRleCBvZiB0aGUgY29sdW1uXHJcbiAgICAgKiB3aGVyZSB0aGUgc2NyaXB0IHNob3VsZCBleHBlY3QgdG8gZmluZCBwbGF5ZXIncyBwbGFjZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3Mucm93PTBdIC0gc3RhcnRpbmcgcm93IHdpdGggcGxheWVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5wcmVmaXhDbHM9J2dvLXJlc3VsdHMtJ10gLSBjc3MgY2xhc3MgcHJlZml4XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmdhbWVDbHM9J2dhbWUnXSAtIGdhbWUgY2VsbCBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmN1cnJlbnRDbHM9J2N1cnJlbnQnXSAtIHNlbGVjdGVkIHJvdyBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzLnJlc3VsdHNdIC0gbWFwIHdpdGggcG9zc2libGUgcmVzdWx0cywgYnkgZGVmYXVsdFxyXG4gICAgICogc3VwcG9ydHMgNCBvcHRpb25zLiBQcm92aWRlIHdpdGggXCJjbGFzc05hbWVcIiAtPiBcInJlZ2V4cFwiIHBhdHRlcm4uXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMud29uPScoWzAtOV0rKVxcXFwrJ10gLSBkZWZhdWx0IHdpbm5pbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMubG9zdD0nKFswLTldKylcXFxcLSddIC0gZGVmYXVsdCBsb3NpbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMuamlnbz0nKFswLTldKyk9J10gLSBkZWZhdWx0IGRyYXcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMudW5yZXNvbHZlZD0nKFswLTldKylcXFxcP10gLSBkZWZhdWx0IHVucmVzb2x2ZWQgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJvd1RhZ3M9J3RyJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlIHN0cmluZ1xyXG4gICAgICogd2l0aCB0YWdzIHJlcHJlc2VudGluZyBwbGF5ZXJzJyByb3dzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmNlbGxUYWdzPSd0ZCx0aCddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZVxyXG4gICAgICogc3RyaW5nIHdpdGggdGFncyBob2xkaW5nIGdhbWUgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00oZWxlbWVudCksIHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MUHJlRWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdGFibGUgPSBjb252ZXJ0KGVsZW1lbnQuaW5uZXJIVE1MLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcblxyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRhYmxlLCBlbGVtZW50KTtcclxuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGFibGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAvLyBub3Qgc3VwcG9ydGVkXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVyc01hcCgpO1xyXG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MudGFibGVDbHMpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc1Nob3dpbmdEZXRhaWxzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc0hpZ2hsaWdodGluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBwbGF5ZXJzIG1hcFxyXG4gICAgICovXHJcbiAgICBjcmVhdGVQbGF5ZXJzTWFwKCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gcGFyc2UodGhpcy5lbGVtZW50LCB0aGlzLnNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGxhY2VtZW50IGluIHRoaXMubWFwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShwbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaCh0aGlzLm1hcFtwbGFjZW1lbnRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcmtzIHBsYXllciBhbmQgaGlzIG9wcG9uZW50cyBoaWdobGlnaHRlZC5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fG51bWJlcnxudWxsfSBbc2V0dGluZ3NdIC0gaGlnaGxpZ2h0aW5nIHNldHRpbmdzIG9yIHBsYXllciB0byBiZSBoaWdobGlnaHRlZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5wbGF5ZXJdIC0gcGxheWVyIHdob3NlIG9wcG9uZW50cyBzaG91bGQgYmVcclxuICAgICAqIGhpZ2hsaWdodGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzZXR0aW5ncy5jb21wYWN0PWZhbHNlXSAtIHdoZXRoZXIgdGhlIHRhYmxlIHNob3VsZCBiZVxyXG4gICAgICogcmVhcnJhbmdlZCB0byBkaXNwbGF5IHJlc3VsdHMgaW4gY29tcGFjdCBzaXplXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLm9wcG9uZW50XSAtIHRoZSBvcHBvbmVudCB3aG9zZSBnYW1lIHdpdGggdGhlXHJcbiAgICAgKiBwbGF5ZXIgc2hvdWxkIGJlIGhpZ2hsaWdodGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjb21wYWN0PWZhbHNlXSAtIGlmIHNldHRpbmdzIGFyZSBub3QgcHJvdmlkZWQgdGhhbiB0aGlzXHJcbiAgICAgKiBhcmd1bWVudCBpcyBjaGVja2VkIGZvciBjb21wYWN0IGZsYWdcclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KHNldHRpbmdzLCBjb21wYWN0ID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgcGxheWVyUGxhY2U7XHJcbiAgICAgICAgbGV0IGdhbWVXaXRoT3Bwb25lbnQ7XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5ncyAmJiB0eXBlb2Ygc2V0dGluZ3MgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHBsYXllclBsYWNlID0gc2V0dGluZ3MucGxheWVyO1xyXG4gICAgICAgICAgICBjb21wYWN0ID0gc2V0dGluZ3MuY29tcGFjdCA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgZ2FtZVdpdGhPcHBvbmVudCA9IHNldHRpbmdzLm9wcG9uZW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBsYXllclBsYWNlID0gc2V0dGluZ3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHRvUHJlZml4ZWRDbGFzc2VzKHRoaXMuc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAvLyBpZiB0YWJsZSBpcyBhbHJlYWR5IHJlYXJyYW5nZWQgdGhlbiB0cmFuc2Zvcm0gaXQgYmFjayB0byBkZWZhdWx0IHN0YXRlXHJcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICByZXN0b3JlTmF0dXJhbE9yZGVyKHRoaXMucGxheWVycyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZWFycmFuZ2UgdGhlIHRhYmxlIGlmIHBsYXllciBhbmQgYXBwcm9wcmlhdGUgc2V0dGluZyBpcyBwcm92aWRlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgY29tcGFjdCkge1xyXG4gICAgICAgICAgICByZWFycmFuZ2VPcmRlcihwbGF5ZXIsIHBsYXllci5vcHBvbmVudHMubWFwKChvcHBvbmVudFBsYWNlKSA9PiB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTaG93aW5nRGV0YWlscyA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGNsYXNzZXMuZ2FtZUNscykpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvdyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGNsYXNzZXMuY3VycmVudENscyk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93UGxhY2VtZW50ID0gbWFya2VkUm93ID8gbWFya2VkUm93LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUGxheWVyID0gbWFya2VkUm93UGxhY2VtZW50ID8gdGhpcy5tYXBbbWFya2VkUm93UGxhY2VtZW50XSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgbWFyayA9IChwbGF5ZXIsIGFjdGl2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBhY3RpdmUgPyAnYWRkJyA6ICdyZW1vdmUnO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLnJvdy5jbGFzc0xpc3RbbWV0aG9kXShjbGFzc2VzLmN1cnJlbnRDbHMpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudFBsYWNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXTtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudC5yb3cuY2xhc3NMaXN0W21ldGhvZF0odGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2xzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGFueSB2aXNpYmxlIGdhbWUgbWFya2luZ3NcclxuICAgICAgICBtYXJrZWRHYW1lcy5mb3JFYWNoKChnYW1lQ2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBnYW1lQ2VsbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrKG1hcmtlZFBsYXllciwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgcGxheWVyIGlmIG5vdCBhbHJlYWR5IG1hcmtlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgcGxheWVyICE9PSBtYXJrZWRQbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyayhwbGF5ZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICBpZiAoZ2FtZVdpdGhPcHBvbmVudCAmJiB0aGlzLm1hcFtnYW1lV2l0aE9wcG9uZW50XSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGdhbWUgPSBwbGF5ZXIuZ2FtZXNbZ2FtZVdpdGhPcHBvbmVudF07XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtnYW1lV2l0aE9wcG9uZW50XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZ2FtZSAmJiBvcHBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdhbWUuY2VsbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQuZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChjbGFzc2VzLmdhbWVDbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50XS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZ2FtZUNscyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHBsYXllclBsYWNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0aW5nID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmlzSGlnaGxpZ2h0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZHMgdG91Y2hlbmQsIGNsaWNrLCBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgbGV0IGhhc1RvdWNoTW92ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGhhc1RvdWNoTW92ZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsICgpID0+IHtcclxuICAgICAgICAgICAgaGFzVG91Y2hNb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaGFzVG91Y2hNb3ZlZCB8fCAodGhpcy5zZXR0aW5ncy5jbGlja2luZyA9PT0gZmFsc2UgJiYgdGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB7IHRhcmdldCwgcGxheWVyLCBvcHBvbmVudCB9ID0gZmV0Y2hJbmZvcm1hdGlvbkFib3V0VGFyZ2V0KGV2ZW50LnRhcmdldCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgY29tcGFjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQgPT09IHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLmNsaWNraW5nIHx8ICF0aGlzLnNldHRpbmdzLmhvdmVyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbXBhY3QgPSAhdGhpcy5pc1Nob3dpbmdEZXRhaWxzO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU2hvd2luZ0RldGFpbHMgfHwgIXRoaXMuc2V0dGluZ3MuaG92ZXJpbmcpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBhY3QgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tcGFjdCkge1xyXG4gICAgICAgICAgICAgICAgbGFzdFRhcmdldFBvcyA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0KHsgcGxheWVyLCBvcHBvbmVudCwgY29tcGFjdCB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsYXN0VGFyZ2V0UG9zKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVUb3BQb3NpdGlvbih0YXJnZXQsIGxhc3RUYXJnZXRQb3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuY2xpY2tpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB7IHRhcmdldCwgcGxheWVyLCBvcHBvbmVudCB9ID0gZmV0Y2hJbmZvcm1hdGlvbkFib3V0VGFyZ2V0KGV2ZW50LnRhcmdldCk7XHJcbiAgICAgICAgICAgIGxldCBjb21wYWN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBsYXN0VGFyZ2V0UG9zO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2hvd2luZ0RldGFpbHMgfHwgdGFyZ2V0LnByb3Blck5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wYWN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2V0dGluZ3MuaG92ZXJpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb21wYWN0KSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0VGFyZ2V0UG9zID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoeyBwbGF5ZXIsIG9wcG9uZW50LCBjb21wYWN0IH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxhc3RUYXJnZXRQb3MpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZVRvcFBvc2l0aW9uKHRhcmdldCwgbGFzdFRhcmdldFBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5pc1Nob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB7IHBsYXllciwgb3Bwb25lbnQgfSA9IGZldGNoSW5mb3JtYXRpb25BYm91dFRhcmdldChldmVudC50YXJnZXQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoeyBwbGF5ZXIsIG9wcG9uZW50IH0pO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLmlzU2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQgJiYgdGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBuZXcgaG92ZXJlZCBlbGVtZW50IGlzIG91dHNpZGUgdGhlIHRhYmxlIHRoZW4gcmVtb3ZlIGFsbFxyXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29tcGFyZSBjdXJyZW50IHRhcmdldCdzIHRvcCBwb3NpdGlvbiB3aXRoIHByZXZpb3VzIHZhbHVlIGFuZCBzY3JvbGwgd2luZG93XHJcbiAqIHRvIHByZXZpb3VzIHZhbHVlIGlmIGl0IGRpZmZlcnNcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmV2aW91c1RvcFxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlVG9wUG9zaXRpb24odGFyZ2V0LCBwcmV2aW91c1RvcCkge1xyXG4gICAgbGV0IGRpZmYgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gcHJldmlvdXNUb3A7XHJcblxyXG4gICAgaWYgKE1hdGguYWJzKGRpZmYpID4gMTApIHtcclxuICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoMCwgZGlmZik7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgaW5mb3JtYXRpb24gYWJvdXQgcGxheWVyIGFuZCBvcHBvbmVudCBwbGFjZW1lbnQgZnJvbSBwcm92aWRlZCBlbGVtZW50XHJcbiAqIG9yIGl0cyBwYXJlbnRzLiBSZXR1cm5zIGFsc28gdGhlIHJvdyB3aXRoIHBsYXllciBwbGFjZW1lbnQgaW5mb3JtYXRpb24uXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIHRhcmdldCBvZiB0aGUgZXZlbnRcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmZ1bmN0aW9uIGZldGNoSW5mb3JtYXRpb25BYm91dFRhcmdldCh0YXJnZXQpIHtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgcGxheWVyOiBudWxsLFxyXG4gICAgICAgIG9wcG9uZW50OiBudWxsLFxyXG4gICAgICAgIHRhcmdldDogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgICAgIGxldCBvcHBvbmVudEdyaWRQbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCk7XHJcbiAgICAgICAgbGV0IHBsYXllckdyaWRQbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpO1xyXG5cclxuICAgICAgICAvLyBnYW1lIGNlbGw/XHJcbiAgICAgICAgaWYgKG9wcG9uZW50R3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICByZXN1bHQub3Bwb25lbnQgPSBOdW1iZXIob3Bwb25lbnRHcmlkUGxhY2VtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgIGlmIChwbGF5ZXJHcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wbGF5ZXIgPSBOdW1iZXIocGxheWVyR3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0LnRhcmdldCA9IHRhcmdldDtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogUmVzdG9yZXMgZGVmYXVsdCBvcmRlciBvZiByb3dzIGluIHRoZSB0YWJsZVxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBwbGF5ZXJzIC0gbGlzdCBvZiBtYXBwaW5nIGRhdGEgZm9yIGFsbCByb3dzXHJcbiAqL1xyXG5mdW5jdGlvbiByZXN0b3JlTmF0dXJhbE9yZGVyKHBsYXllcnMpIHtcclxuICAgIHBsYXllcnNcclxuICAgICAgICAuZmlsdGVyKChwbGF5ZXIpID0+IHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpXHJcbiAgICAgICAgLnJldmVyc2UoKVxyXG4gICAgICAgIC5mb3JFYWNoKChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQocGxheWVyLnJvdyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBsYXllci5yb3csIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBudWxsO1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUmVhcnJhbmdlcyB0aGUgcm93cyBpbiBhIHRhYmxlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwbGF5ZXIgLSBwbGF5ZXIgbWFwcGluZyBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9wcG9uZW50cyAtIGxpc3Qgb2Ygb3Bwb25lbnRzIG1hcHBpbmcgZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gcmVhcnJhbmdlT3JkZXIocGxheWVyLCBvcHBvbmVudHMpIHtcclxuICAgIGNvbnN0IHBhcmVudCA9IHBsYXllci5yb3cucGFyZW50Tm9kZTtcclxuICAgIGxldCBhZnRlciA9IHBsYXllci5yb3cubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG5cclxuICAgIG9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudCkgPT4ge1xyXG4gICAgICAgIG9wcG9uZW50LnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG9wcG9uZW50LnJvdy5uZXh0RWxlbWVudFNpYmxpbmcgfHwgLTE7XHJcblxyXG4gICAgICAgIGlmIChvcHBvbmVudC50b3VybmFtZW50UGxhY2UgPCBwbGF5ZXIudG91cm5hbWVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUob3Bwb25lbnQucm93LCBwbGF5ZXIucm93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgYWZ0ZXIpO1xyXG4gICAgICAgICAgICBhZnRlciA9IG9wcG9uZW50LnJvdy5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBhc0FycmF5LCBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9SZXN1bHRzV2l0aFJlZ0V4cCB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5cclxuZnVuY3Rpb24gd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgcGxhY2VtZW50KSB7XHJcbiAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHBsYWNlbWVudCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBwcm92aWRlZCB0YWJsZSBhbmQgY3JlYXRlIHJlc3VsdHMgbWFwXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlIC0gdGFibGUgcmVzdWx0cyBjb250YWluZXJcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddIC0gc2V0dGluZ3MgZm9yIHBhcnNlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yb3dUYWdzXVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5jZWxsVGFnc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucmVzdWx0c11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucGxhY2VDb2x1bW5dXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnN0YXJ0aW5nUm93XVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2UodGFibGUsIGNvbmZpZykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCBjb25maWcpO1xyXG4gICAgY29uc3Qgcm93cyA9IGFzQXJyYXkodGFibGUucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5yb3dUYWdzKSk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gdG9SZXN1bHRzV2l0aFJlZ0V4cChzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXBDb3VudCA9IHJlc3VsdHNNYXAubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlR2FtZXMocGxheWVyLCBjZWxscykge1xyXG4gICAgICAgIC8vIGlmIGNvbHVtbnMgcm91bmRzIGFyZSBwcm92aWRlZCB0aGVuIHBhcnNlIG9ubHkgdGhlbVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgY2VsbHMgPSBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgocm91bmQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2VsbHNbTnVtYmVyKHJvdW5kKV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50UGxhY2U7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRDbHM7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGNlbGwuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxUKSAmJiBjZWxsLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpKSB7XHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudFBsYWNlID0gTnVtYmVyKGNlbGwuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCkpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q2xzID0gY2VsbC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsLnRleHRDb250ZW50Lm1hdGNoKHJlc3VsdHNNYXBbaV0ucmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50UGxhY2UgPSBOdW1iZXIobWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENscyA9IHJlc3VsdHNNYXBbaV0uY2xzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQsIG9wcG9uZW50UGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxULCByZXN1bHRzTWFwW2ldLmNscyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgY2xzOiByZXN1bHRDbHNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICBsZXQgbGFzdEdyaWRQbGFjZW1lbnQ7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2VsbHMgPSBhc0FycmF5KHJvdy5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLmNlbGxUYWdzKSk7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBkZWZhdWx0IHBsYWNlXHJcbiAgICAgICAgbGV0IGdyaWRQbGFjZW1lbnQgPSAtMTtcclxuXHJcbiAgICAgICAgLy8gbm8gY2VsbHM/IHVubGlrZWx5IHRvIGJlIGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmICghY2VsbHMubGVuZ3RoIHx8ICFjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0pIHtcclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLnRleHRDb250ZW50LCAxMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlOiAtMSxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocm93Lmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSkge1xyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gTnVtYmVyKHJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgbm8gcGxheWVyIGhhcyBiZWVuIG1hcHBlZFxyXG4gICAgICAgICAgICBpZiAoIWxhc3RHcmlkUGxhY2VtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4odG91cm5hbWVudFBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIHRvdXJuYW1lbnQgaWYgZGVmaW5lZCAocG9zc2libHkgc2hvd2luZyBhbiBleHRyYWN0IGZyb20gZ3JlYXRlciB0YWJsZSlcclxuICAgICAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50IHx8IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gbGFzdEdyaWRQbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gc2V0IGEgbG93ZXIgcGxhY2Ugbm9uZXRoZWxlc3NcclxuICAgICAgICAgICAgaWYgKCF0b3VybmFtZW50UGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPyBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA6IDE7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdXJuYW1lbnRQbGFjZW1lbnQgPD0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ3JpZFBsYWNlbWVudCA9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJzZUdhbWVzKHBsYXllciwgY2VsbHMpO1xyXG5cclxuICAgICAgICBwbGF5ZXIudG91cm5hbWVudFBsYWNlID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLnNvcnQoKGEsIGIpID0+IGEgPiBiID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgcmVzdWx0c1tncmlkUGxhY2VtZW50XSA9IHBsYXllcjtcclxuXHJcbiAgICAgICAgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIGxhc3RHcmlkUGxhY2VtZW50ID0gZ3JpZFBsYWNlbWVudDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHRvUmVzdWx0c1dpdGhSZWdFeHAgfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyByYXcgcmVzdWx0cyBzdHJpbmcgaW50byB0YWJsZSB3aXRoIHJvd3MgYW5kIGNlbGxzLlxyXG4gKiBSZXR1cm5zIG51bGwgaWYgbm90IHZhbGlkIGlucHV0LlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmF3UmVzdWx0c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZ11cclxuICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcuc3RhcnRpbmdSb3c9MF0gLSBpbmZvcm1zIHdoZXJlIGlzIHRoZSBmaXJzdCByb3cgd2l0aCByZXN1bHRzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLnBsYWNlQ29sdW1uPTBdIC0gaW5mb3JtcyBpbiB3aGljaCBjb2x1bW4gaXMgdGhlIHBsYWNlIGxvY2F0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcucm91bmRzQ29sdW1uc10gLSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBjb2x1bW5zIHdoZXJlIGdhbWUgcmVzdWx0cyBhcmUgbG9jYXRlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5jZWxsU2VwYXJhdG9yPSdbXFx0IF0rJ10gLSBzZXBhcmF0ZWQgdXNlZCB0byBkaXZpZGUgcm93cyBpbnRvIGNlbGxzXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NvbmZpZy5qb2luTmFtZXM9dHJ1ZV0gLSBqb2lucyB0d28gY29uc2VjdXRpdmUgY2VsbHMgYWZ0ZXIgdGhlIHBsYWNlIGNvbHVtbiBpbnRvIG9uZSBjZWxsXHJcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxudWxsfVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udmVydFJhd1Jlc3VsdHNUb1RhYmxlKHJhd1Jlc3VsdHMsIGNvbmZpZykge1xyXG4gICAgY29uc3Qgb3V0cHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuXHJcbiAgICBpZiAoIXJhd1Jlc3VsdHMpIHtcclxuICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgY29uZmlnKTtcclxuICAgIGNvbnN0IGxpbmVzID0gcmF3UmVzdWx0cy5zcGxpdCgvXFxyXFxufFxcbi8pO1xyXG5cclxuICAgIGlmIChsaW5lcy5sZW5ndGggPD0gMiAmJiAhbGluZXNbMF0gJiYgIWxpbmVzWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gdG9SZXN1bHRzV2l0aFJlZ0V4cChzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXBDb3VudCA9IHJlc3VsdHNNYXAubGVuZ3RoO1xyXG5cclxuICAgIGNvbnN0IHJvd3MgPSBsaW5lc1xyXG4gICAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmVcclxuXHJcbiAgICAgICAgICAgIC8vIHByb2JhYmx5IHVuaGVhbHRoeSByZXBsYWNpbmcgc3BhY2UgaW4gcmFuayBpbiBvcmRlciB0byBtYWtlIHN1cmVcclxuICAgICAgICAgICAgLy8gdGhhdCBpdCB3b24ndCBiZSBicm9rZW4gaW50byB0d28gY2VsbHNcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyhbMC05XSspXFxzKGRhbnxreXUpL2ksICckMV8kMicpXHJcblxyXG4gICAgICAgICAgICAvLyBzcGxpdCBsaW5lIHRvIGNlbGxzIChjb25zaWRlciB0YWJzIGFuZCBzcGFjZXMgYXMgc2VwYXJhdG9ycyBieSBkZWZhdWx0KVxyXG4gICAgICAgICAgICAuc3BsaXQobmV3IFJlZ0V4cChzZXR0aW5ncy5jZWxsU2VwYXJhdG9yKSlcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBlbXB0eSBjZWxsc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChjZWxsKSA9PiBjZWxsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGVtcHR5IHJvd3Mgb3Igcm93cyBzdGFydGluZyB3aXRoICc7JyAoRUdEL0ZGRyBjb21tZW50KVxyXG4gICAgICAgIC5maWx0ZXIoKGNlbGxzKSA9PiBjZWxscy5sZW5ndGggPiAwICYmIGNlbGxzWzBdLmluZGV4T2YoJzsnKSAhPT0gMCk7XHJcblxyXG4gICAgY29uc3QgdGFibGVXaWR0aCA9IHJvd3MucmVkdWNlKChwcmV2LCBsaW5lKSA9PiBNYXRoLm1heChwcmV2LCBsaW5lLmxlbmd0aCksIDApO1xyXG4gICAgY29uc3QgdGFibGVNb2RpZmllciA9IHNldHRpbmdzLmpvaW5OYW1lcyA/IC0xIDogMDtcclxuICAgIGNvbnN0IGpvaW5OYW1lUG9zID0gc2V0dGluZ3MucGxhY2VDb2x1bW4gKyAxO1xyXG5cclxuICAgIGxldCBnYW1lc0luQ29sdW1ucyA9IG51bGw7XHJcblxyXG4gICAgLy8gaWYgY29sdW1ucyByb3VuZHMgYXJlIHByb3ZpZGVkIHRoZW4gY29udmVydCBvbmx5IHRoZW1cclxuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBnYW1lc0luQ29sdW1ucyA9IHNldHRpbmdzLnJvdW5kc0NvbHVtbnMuc3BsaXQoJywnKS5tYXAoTnVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcHJldmlvdXNQbGFjZTtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKGNlbGxzLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSBjZWxscy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghd2lkdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cgfHwgd2lkdGggPCAodGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpKSB7XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdjb2xzcGFuJywgdGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpO1xyXG4gICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbHMuam9pbignICcpO1xyXG5cclxuICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCAtMSk7XHJcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLCAxMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocGxhY2UpICYmICFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsQ29udGVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIC0xKTtcclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHByZXZpb3VzUGxhY2UgfHwgcGxhY2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muam9pbk5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbHMuc3BsaWNlKGpvaW5OYW1lUG9zLCAyLCBgJHtjZWxsc1tqb2luTmFtZVBvc119ICAke2NlbGxzW2pvaW5OYW1lUG9zICsgMV19YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbENvbnRlbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbENvbnRlbnQucmVwbGFjZSgvXy8sICcgJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2FtZXNJbkNvbHVtbnMgfHwgZ2FtZXNJbkNvbHVtbnMuaW5kZXhPZihpbmRleCkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHNNYXBDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsQ29udGVudC5tYXRjaChyZXN1bHRzTWFwW2ldLnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudFBsYWNlbWVudCA9IG1hdGNoWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wcG9uZW50cy5wdXNoKG9wcG9uZW50UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCwgb3Bwb25lbnRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQsIHJlc3VsdHNNYXBbaV0uY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UUywgb3Bwb25lbnRzLmpvaW4oJywnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQbGFjZSA9IDI7XHJcbiAgICAgICAgICAgICAgICB9ICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BsYWNlICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRwdXQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG5cclxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUkVTVUxUX1RBQkxFLCAnJyk7XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHt7cHJlZml4Q2xzOiBzdHJpbmcsIHNob3dpbmdEZXRhaWxzQ2xzOiBzdHJpbmcsIHRhYmxlQ2xzOiBzdHJpbmcsIGdhbWVDbHM6IHN0cmluZywgY3VycmVudENsczogc3RyaW5nLCByZXN1bHRzOiB7d29uOiBzdHJpbmcsIGxvc3Q6IHN0cmluZywgamlnbzogc3RyaW5nLCB1bnJlc29sdmVkOiBzdHJpbmd9LCBzdGFydGluZ1JvdzogbnVtYmVyLCBwbGFjZUNvbHVtbjogbnVtYmVyLCByb3VuZHNDb2x1bW5zOiBudWxsLCByb3dUYWdzOiBzdHJpbmcsIGNlbGxUYWdzOiBzdHJpbmcsIHJvd1NlcGFyYXRvcjogc3RyaW5nLCBob3ZlcmluZzogYm9vbGVhbiwgY2xpY2tpbmc6IGJvb2xlYW59fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgICBwcmVmaXhDbHM6ICdnby1yZXN1bHRzLScsXHJcbiAgICBzaG93aW5nRGV0YWlsc0Nsczonc2hvd2luZy1kZXRhaWxzJyxcclxuICAgIHRhYmxlQ2xzOiAndGFibGUnLFxyXG4gICAgZ2FtZUNsczogJ2dhbWUnLFxyXG4gICAgY3VycmVudENsczogJ2N1cnJlbnQnLFxyXG5cclxuICAgIHJlc3VsdHM6IHtcclxuICAgICAgICB3b246ICcoWzAtOV0rKVxcXFwrJyxcclxuICAgICAgICBsb3N0OiAnKFswLTldKylcXFxcLScsXHJcbiAgICAgICAgamlnbzogJyhbMC05XSspPScsXHJcbiAgICAgICAgdW5yZXNvbHZlZDogJyhbMC05XSspXFxcXD8nXHJcbiAgICB9LFxyXG5cclxuICAgIHN0YXJ0aW5nUm93OiAwLFxyXG4gICAgcGxhY2VDb2x1bW46IDAsXHJcbiAgICByb3VuZHNDb2x1bW5zOiBudWxsLFxyXG5cclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJyxcclxuICAgIGNlbGxTZXBhcmF0b3I6ICdbXFx0IF0rJyxcclxuICAgIGpvaW5OYW1lczogdHJ1ZSxcclxuXHJcbiAgICBob3ZlcmluZzogdHJ1ZSxcclxuICAgIGNsaWNraW5nOiB0cnVlXHJcbn07XHJcblxyXG5jb25zdCBDTEFTU0VTX1RPX0JFX1BSRUZJWEVEID0gW1xyXG4gICAgJ3Nob3dpbmdEZXRhaWxzQ2xzJyxcclxuICAgICd0YWJsZUNscycsXHJcbiAgICAnZ2FtZUNscycsXHJcbiAgICAnY3VycmVudENscydcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBOYW1lcyBvZiBhdHRyaWJ1dGVzIHVzZWQgaW4gdGhpcyBwbHVnaW5cclxuICogQHR5cGUge3tSRVNVTFRfVEFCTEU6IHN0cmluZywgU0VUVElOR19TVEFSVElOR19ST1c6IHN0cmluZywgU0VUVElOR19QTEFDRV9DT0xVTU46IHN0cmluZywgU0VUVElOR19ST1VORFNfQ09MVU1OUzogc3RyaW5nLCBQTEFZRVJfUExBQ0VNRU5UOiBzdHJpbmcsIE9QUE9ORU5UX1BMQUNFTUVOVDogc3RyaW5nLCBHQU1FX1JFU1VMVDogc3RyaW5nfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBET01fQVRUUklCVVRFUyA9IHtcclxuICAgIFJFU1VMVF9UQUJMRTogJ2RhdGEtZ28tcmVzdWx0cycsXHJcbiAgICBTRVRUSU5HX1NUQVJUSU5HX1JPVzogJ2RhdGEtZ28tc3RhcnRpbmctcm93JyxcclxuICAgIFNFVFRJTkdfUExBQ0VfQ09MVU1OOiAnZGF0YS1nby1wbGFjZS1jb2wnLFxyXG4gICAgU0VUVElOR19ST1VORFNfQ09MVU1OUzogJ2RhdGEtZ28tcm91bmRzLWNvbHMnLFxyXG4gICAgU0VUVElOR19DTElDS0lORzogJ2RhdGEtZ28tY2xpY2tpbmcnLFxyXG4gICAgU0VUVElOR19IT1ZFUklORzogJ2RhdGEtZ28taG92ZXJpbmcnLFxyXG4gICAgUExBWUVSX1BMQUNFTUVOVDogJ2RhdGEtZ28tcGxhY2UnLFxyXG4gICAgT1BQT05FTlRfUExBQ0VNRU5UOiAnZGF0YS1nby1vcHBvbmVudCcsXHJcbiAgICBPUFBPTkVOVFM6ICdkYXRhLWdvLW9wcG9uZW50cycsXHJcbiAgICBHQU1FX1JFU1VMVDogJ2RhdGEtZ28tcmVzdWx0J1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgbWFwIG9mIHBvc3NpYmxlIHJlc3VsdHMgaW50byBhcnJheSBvZiBvYmplY3RzIHdpdGggcmVnZXhwIHN0cmluZ1xyXG4gKiBjb252ZXJ0ZWQgaW50byBSZWdFeHAgb2JqZWN0cy5cclxuICogQHBhcmFtIHtvYmplY3R9IHJlc3VsdHNcclxuICogQHJldHVybnMge0FycmF5Ljx7Y2xzOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwfT59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9SZXN1bHRzV2l0aFJlZ0V4cChyZXN1bHRzKSB7XHJcbiAgICBjb25zdCBtYXAgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBjbHMgaW4gcmVzdWx0cykge1xyXG4gICAgICAgIGlmIChyZXN1bHRzLmhhc093blByb3BlcnR5KGNscykpIHtcclxuICAgICAgICAgICAgbWFwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY2xzLFxyXG4gICAgICAgICAgICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKHJlc3VsdHNbY2xzXSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG9iamVjdCB3aXRoIHByZWZpeGVkIGNsYXNzZXMgYmFzZWQgb24gc2V0dGluZ3NcclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzXHJcbiAqIEByZXR1cm5zIHt7fX1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1ByZWZpeGVkQ2xhc3NlcyhzZXR0aW5ncykge1xyXG4gICAgbGV0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIENMQVNTRVNfVE9fQkVfUFJFRklYRUQuZm9yRWFjaCgoY2xzKSA9PiB7XHJcbiAgICAgICAgcmVzdWx0W2Nsc10gPSBzZXR0aW5ncy5wcmVmaXhDbHMgKyBzZXR0aW5nc1tjbHNdO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0aGUgZWxlbWVudCBmb3IgMyBhdHRyaWJ1dGVzIGFuZCByZXR1cm5zIG9iamVjdCB3aXRoIHNldCBhcHByb3ByaWF0ZVxyXG4gKiB2YWx1ZXNcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGVcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00odGFibGUpIHtcclxuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19QTEFDRV9DT0xVTU4pKSB7XHJcbiAgICAgICAgb3V0cHV0LnBsYWNlQ29sdW1uID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1BMQUNFX0NPTFVNTikpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19TVEFSVElOR19ST1cpKSB7XHJcbiAgICAgICAgb3V0cHV0LnN0YXJ0aW5nUm93ID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1NUQVJUSU5HX1JPVykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19ST1VORFNfQ09MVU1OUykpIHtcclxuICAgICAgICBvdXRwdXQucm91bmRzQ29sdW1ucyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1JPVU5EU19DT0xVTU5TKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpKSB7XHJcbiAgICAgICAgb3V0cHV0LmNsaWNraW5nID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpICE9PSAnZmFsc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykpIHtcclxuICAgICAgICBvdXRwdXQuaG92ZXJpbmcgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykgIT09ICdmYWxzZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGFycmF5LWxpa2Ugb2JqZWN0cyAoc3VjaCBhcyBhcmd1bWVudHMgb3Igbm9kZSBsaXN0cykgaW50byBhbiBhcnJheVxyXG4gKiBAcGFyYW0geyp9IGFycmF5TGlrZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFQ+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzQXJyYXkoYXJyYXlMaWtlKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCBjb250YWluaW5nIGtleXMgb25seSBmcm9tIGRlZmF1bHRPYmogYnV0IHZhbHVlcyBhcmUgdGFrZW5cclxuICogZnJvbSBpZiBleGlzdCAoc3RhcnRpbmcgZnJvbSB0aGUgbGFzdCBvYmplY3QgcHJvdmlkZWQpXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0T2JqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IC4uLm9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cyhkZWZhdWx0T2JqLCAuLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCBvdmVycmlkZXMgPSBvYmplY3RzXHJcbiAgICAgICAgLmZpbHRlcigob2JqKSA9PiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JylcclxuICAgICAgICAucmV2ZXJzZSgpO1xyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gb3ZlcnJpZGVzLmxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG1haW5Mb29wOiBmb3IgKGxldCBrZXkgaW4gZGVmYXVsdE9iaikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAob3ZlcnJpZGVzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb3ZlcnJpZGVzW2ldW2tleV07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBtYWluTG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzdWx0W2tleV0gPSBkZWZhdWx0T2JqW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCB0aGF0IGhhcyBtZXJnZWQgcHJvcGVydGllcyBmcm9tIGFsbCBwcm92aWRlZCBvYmplY3RzLlxyXG4gKiBMYXRlc3QgYXJndW1lbnRzIG92ZXJyaWRlcyB0aGUgZWFybGllciB2YWx1ZXMuXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lKC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG9iamVjdHMuZm9yRWFjaCgob2JqZWN0KSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59Il19
(1)
});
