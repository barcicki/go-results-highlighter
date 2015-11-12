!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.GoResultsHighlighter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _plugin = _dereq_('./plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _settings = _dereq_('./settings');

var _utils = _dereq_('./utils');

function initialize() {
    (0, _utils.asArray)(document.querySelectorAll('[' + _settings.DOM_ATTRIBUTES.RESULT_TABLE + ']')).forEach(function (tableEl) {
        return new _plugin2['default'](tableEl);
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
            var highlighter = new _plugin2['default'](element, options);

            $(highlighter.element).data('GoResultsHighlighter', highlighter);
        });
        return this;
    };
}

exports['default'] = _plugin2['default'];
module.exports = exports['default'];

},{"./plugin":3,"./settings":5,"./utils":6}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = parse;

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

module.exports = exports['default'];

},{"./settings":5,"./utils":6}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _settings = _dereq_('./settings');

var _parser = _dereq_('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _raw2table = _dereq_('./raw2table');

var _raw2table2 = _interopRequireDefault(_raw2table);

var _utils = _dereq_('./utils');

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
            var table = (0, _raw2table2['default'])(element.innerHTML, settings);
            var _parent = element.parentNode;

            _parent.insertBefore(table, element);
            _parent.removeChild(element);

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
        this.showingDetails = false;
    }

    /**
     * Creates players map
     */

    _createClass(GoResultsHighlighter, [{
        key: 'createPlayersMap',
        value: function createPlayersMap() {
            this.map = (0, _parser2['default'])(this.element, this.settings);
            this.players = [];

            for (var placement in this.map) {
                if (this.map.hasOwnProperty(placement)) {
                    this.players.push(this.map[placement]);
                }
            }
        }

        /**
         * Marks the row for selected player and a cell with opponents game if
         * provided.
         * @param {number} [playerPlace] - player's place, selection will be remove
         * if not player is found for given place
         * @param {number} [opponentPlace] - player's opponent's place - to mark
         * cells with game between player and the opponent
         */
    }, {
        key: 'selectPlayer',
        value: function selectPlayer(playerPlace, opponentPlace) {
            var _this = this;

            var currentCls = this.settings.prefixCls + this.settings.currentCls;
            var gameCls = this.settings.prefixCls + this.settings.gameCls;

            var player = this.map[playerPlace];

            var markedGames = (0, _utils.asArray)(this.element.querySelectorAll('.' + gameCls));
            var markedRow = this.element.querySelector('.' + currentCls);
            var markedRowPlacement = markedRow ? markedRow.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT) : null;
            var markedPlayer = markedRowPlacement ? this.map[markedRowPlacement] : null;

            // remove any visible game markings
            markedGames.forEach(function (gameCell) {
                gameCell.classList.remove(gameCls);
            });

            // unmark player if necessary
            if (markedPlayer && markedPlayer !== player) {
                mark.call(this, markedPlayer, false);
            }

            // mark the player if not already marked
            if (player && player !== markedPlayer) {
                mark.call(this, player, true);
            }

            // mark all the games
            if (this.showingDetails) {
                player.opponents.forEach(function (opponent) {
                    _this.map[opponent].games[playerPlace].cell.classList.add(gameCls);
                });

                // mark the game between the player and the opponent
            } else if (player && opponentPlace) {
                    player.games[opponentPlace].cell.classList.add(gameCls);
                    this.map[opponentPlace].games[playerPlace].cell.classList.add(gameCls);
                }

            function mark(player, active) {
                var _this2 = this;

                var method = active ? 'add' : 'remove';

                player.row.classList[method](currentCls);

                player.opponents.forEach(function (opponentPlace) {
                    var opponent = _this2.map[opponentPlace];

                    opponent.row.classList[method](_this2.settings.prefixCls + player.games[opponentPlace].cls);
                });
            }
        }

        /**
         * Restores proper order of results
         */
    }, {
        key: 'restoreFullResults',
        value: function restoreFullResults() {
            this.players.filter(function (player) {
                return player.row.properNextSibling;
            }).reverse().forEach(function (player) {
                player.row.parentNode.insertBefore(player.row, player.row.properNextSibling);
                player.row.properNextSibling = null;
            });

            this.element.classList.remove(this.settings.prefixCls + this.settings.showingDetailsCls);
            this.showingDetails = false;
        }

        /**
         * Shows details for selected player
         * @param {number} [playerPlace]
         */
    }, {
        key: 'showDetails',
        value: function showDetails(playerPlace) {
            var _this3 = this;

            var player = this.map[playerPlace];

            if (!player) {
                return;
            }

            var parent = player.row.parentNode;
            var after = player.row.nextSibling;

            player.opponents.forEach(function (opponentPlace) {
                var opponent = _this3.map[opponentPlace];

                opponent.row.properNextSibling = opponent.row.nextSibling;

                if (opponentPlace < playerPlace) {
                    parent.insertBefore(opponent.row, player.row);
                } else {
                    parent.insertBefore(opponent.row, after);
                    after = opponent.row.nextSibling;
                }
            });

            this.element.classList.add(this.settings.prefixCls + this.settings.showingDetailsCls);
            this.showingDetails = true;
            this.selectPlayer(playerPlace);
        }

        /**
         * Binds mouseover and mouseout events listeners to the element.
         */
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this4 = this;

            this.element.addEventListener('click', function (event) {
                if (_this4.settings.clicking === false) {
                    return;
                }

                var target = event.target;
                var playerPlacement = null;

                // fetch information about hovered element
                while (target && target !== document) {
                    var placement = target.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT);

                    // player row? no further search is necessary
                    if (placement) {
                        playerPlacement = placement;
                        break;
                    }

                    target = target.parentNode;
                }

                if (!playerPlacement) {
                    return;
                }

                var lastTargetPos = undefined;

                if (!_this4.showingDetails) {
                    _this4.showDetails(playerPlacement);
                } else if (target.properNextSibling) {
                    lastTargetPos = target.getBoundingClientRect().top;

                    _this4.restoreFullResults();
                    _this4.showDetails(playerPlacement);
                } else {
                    lastTargetPos = target.getBoundingClientRect().top;

                    _this4.restoreFullResults();
                    _this4.selectPlayer(playerPlacement);
                }

                if (lastTargetPos) {
                    var diff = target.getBoundingClientRect().top - lastTargetPos;

                    if (Math.abs(diff) > 10) {
                        window.scrollBy(0, diff);
                    }
                }
            });

            this.element.addEventListener('mouseover', function (event) {
                if (_this4.settings.hovering === false || _this4.showingDetails) {
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
                        opponent = opponentGridPlacement;
                    }

                    // player row? no further search is necessary
                    if (playerGridPlacement) {
                        player = playerGridPlacement;
                        break;
                    }

                    target = target.parentNode;
                }

                if (!player) {
                    return;
                }

                _this4.selectPlayer(player, opponent);
            }, false);

            this.element.addEventListener('mouseout', function (event) {
                if (_this4.settings.hovering === false || _this4.showingDetails) {
                    return;
                }

                var target = event.relatedTarget;

                while (target && target !== document && target !== _this4.element) {
                    target = target.parentNode;
                }

                // if new hovered element is outside the table then remove all
                // selections
                if (target !== _this4.element) {
                    _this4.selectPlayer(-1);
                }
            }, false);
        }
    }]);

    return GoResultsHighlighter;
})();

exports['default'] = GoResultsHighlighter;

GoResultsHighlighter.DEFAULT_SETTINGS = _settings.DEFAULT_SETTINGS;
module.exports = exports['default'];

},{"./parser":2,"./raw2table":4,"./settings":5,"./utils":6}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = convertRawResultsToTable;

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
    if (!rawResults) {
        return null;
    }

    var settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, config);
    var lines = rawResults.split(/\r\n|\n/);

    if (lines.length <= 2 && !lines[0] && !lines[1]) {
        return null;
    }

    var resultsMap = (0, _settings.toResultsWithRegExp)(settings.results);
    var resultsMapCount = resultsMap.length;
    var output = document.createElement('table');

    var rows = lines.map(function (line) {
        return line

        // probably unhealthy replacing space in rank in order to make sure
        // that it won't be broken into two cells
        .replace(/([0-9]+)\s(dan|kyu)/i, '$1_$2')

        // split line to cells (consider tabs and spaces as separators by default)
        .split(new RegExp(settings.rowSeparator))

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

module.exports = exports['default'];

},{"./settings":5,"./utils":6}],5:[function(_dereq_,module,exports){
'use strict';

/**
 * Default settings of the plugin
 * @type {{prefixCls: string, showingDetailsCls: string, tableCls: string, gameCls: string, currentCls: string, results: {won: string, lost: string, jigo: string, unresolved: string}, startingRow: number, placeColumn: number, roundsColumns: null, rowTags: string, cellTags: string, rowSeparator: string, hovering: boolean, clicking: boolean}}
 */
Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.toResultsWithRegExp = toResultsWithRegExp;
exports.readTableSettingsFromDOM = readTableSettingsFromDOM;
var DEFAULT_SETTINGS = {
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
    rowSeparator: '[\t ]+',
    joinNames: true,

    hovering: true,
    clicking: true
};

exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
/**
 * Names of attributes used in this plugin
 * @type {{RESULT_TABLE: string, SETTING_STARTING_ROW: string, SETTING_PLACE_COLUMN: string, SETTING_ROUNDS_COLUMNS: string, PLAYER_PLACEMENT: string, OPPONENT_PLACEMENT: string, GAME_RESULT: string}}
 */
var DOM_ATTRIBUTES = {
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

exports.DOM_ATTRIBUTES = DOM_ATTRIBUTES;
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
'use strict';

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */
Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.asArray = asArray;
exports.defaults = defaults;
exports.combine = combine;

function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object containing keys only from defaultObj but values are taken
 * from if exist (starting from the last object provided)
 * @param {object} defaultObj
 * @param {Array.<object>} objects
 * @returns {object}
 */

function defaults(defaultObj) {
    for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objects[_key - 1] = arguments[_key];
    }

    var overrides = objects.filter(function (obj) {
        return typeof obj === 'object';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvZmFrZV83M2FmOTE4OC5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BhcnNlci5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BsdWdpbi5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3JhdzJ0YWJsZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3NldHRpbmdzLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7O3NCQUVvQixVQUFVOzs7O3dCQUNaLFlBQVk7O3FCQUNuQixTQUFTOztBQUVqQyxTQUFTLFVBQVUsR0FBRztBQUNsQix3QkFBUSxRQUFRLENBQUMsZ0JBQWdCLE9BQUsseUJBQWUsWUFBWSxPQUFJLENBQUMsQ0FDakUsT0FBTyxDQUFDLFVBQUMsT0FBTztlQUFLLHdCQUF5QixPQUFPLENBQUM7S0FBQSxDQUFDLENBQUM7Q0FDaEU7O0FBRUQsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRTtBQUNwQyxjQUFVLEVBQUUsQ0FBQztDQUNoQixNQUFNO0FBQ0gsWUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNwRTs7QUFFRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUMvQixV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cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgR29SZXN1bHRzSGlnaGxpZ2h0ZXIgZnJvbSAnLi9wbHVnaW4nO1xyXG5pbXBvcnQgeyBET01fQVRUUklCVVRFUyB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBhc0FycmF5IH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgYXNBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbJHtET01fQVRUUklCVVRFUy5SRVNVTFRfVEFCTEV9XWApKVxyXG4gICAgICAgIC5mb3JFYWNoKCh0YWJsZUVsKSA9PiBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIodGFibGVFbCkpO1xyXG59XHJcblxyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgaW5pdGlhbGl6ZSgpO1xyXG59IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXRpYWxpemUsIGZhbHNlKTtcclxufVxyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBqUXVlcnkuZm4uZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVyID0gbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgJChoaWdobGlnaHRlci5lbGVtZW50KS5kYXRhKCdHb1Jlc3VsdHNIaWdobGlnaHRlcicsIGhpZ2hsaWdodGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdvUmVzdWx0c0hpZ2hsaWdodGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IGFzQXJyYXksIGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1Jlc3VsdHNXaXRoUmVnRXhwIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcblxyXG5mdW5jdGlvbiB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBwbGFjZW1lbnQpIHtcclxuICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgcGxhY2VtZW50KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYXZlcnNlIHByb3ZpZGVkIHRhYmxlIGFuZCBjcmVhdGUgcmVzdWx0cyBtYXBcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGUgLSB0YWJsZSByZXN1bHRzIGNvbnRhaW5lclxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZ10gLSBzZXR0aW5ncyBmb3IgcGFyc2VyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnJvd1RhZ3NdXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLmNlbGxUYWdzXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5yZXN1bHRzXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5wbGFjZUNvbHVtbl1cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucm91bmRzQ29sdW1uc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcuc3RhcnRpbmdSb3ddXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZSh0YWJsZSwgY29uZmlnKSB7XHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIGNvbmZpZyk7XHJcbiAgICBjb25zdCByb3dzID0gYXNBcnJheSh0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLnJvd1RhZ3MpKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSB0b1Jlc3VsdHNXaXRoUmVnRXhwKHNldHRpbmdzLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcENvdW50ID0gcmVzdWx0c01hcC5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHRzID0ge307XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyc2VHYW1lcyhwbGF5ZXIsIGNlbGxzKSB7XHJcbiAgICAgICAgLy8gaWYgY29sdW1ucyByb3VuZHMgYXJlIHByb3ZpZGVkIHRoZW4gcGFyc2Ugb25seSB0aGVtXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBjZWxscyA9IHNldHRpbmdzLnJvdW5kc0NvbHVtbnNcclxuICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpXHJcbiAgICAgICAgICAgICAgICAubWFwKChyb3VuZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjZWxsc1tOdW1iZXIocm91bmQpXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnRQbGFjZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdENscztcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAoY2VsbC5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQpICYmIGNlbGwuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCkpIHtcclxuICAgICAgICAgICAgICAgIG9wcG9uZW50UGxhY2UgPSBOdW1iZXIoY2VsbC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRDbHMgPSBjZWxsLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzTWFwQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGwudGV4dENvbnRlbnQubWF0Y2gocmVzdWx0c01hcFtpXS5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnRQbGFjZSA9IE51bWJlcihtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Q2xzID0gcmVzdWx0c01hcFtpXS5jbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCwgb3Bwb25lbnRQbGFjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQsIHJlc3VsdHNNYXBbaV0uY2xzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXSA9IHtcclxuICAgICAgICAgICAgICAgIGNlbGwsXHJcbiAgICAgICAgICAgICAgICBjbHM6IHJlc3VsdENsc1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5wdXNoKG9wcG9uZW50UGxhY2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgIGxldCBsYXN0R3JpZFBsYWNlbWVudDtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcclxuICAgICAgICBpZiAoaW5kZXggPCBzZXR0aW5ncy5zdGFydGluZ1Jvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZWxscyA9IGFzQXJyYXkocm93LnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3MuY2VsbFRhZ3MpKTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHQgcGxhY2VcclxuICAgICAgICBsZXQgZ3JpZFBsYWNlbWVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLyBubyBjZWxscz8gdW5saWtlbHkgdG8gYmUgYSByZXN1bHQgcm93XHJcbiAgICAgICAgaWYgKCFjZWxscy5sZW5ndGggfHwgIWNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXSkge1xyXG4gICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBwYXJzZUludChjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0udGV4dENvbnRlbnQsIDEwKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0ge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2U6IC0xLFxyXG4gICAgICAgICAgICByb3csXHJcbiAgICAgICAgICAgIGdhbWVzOiB7fSxcclxuICAgICAgICAgICAgb3Bwb25lbnRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChyb3cuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpKSB7XHJcbiAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBOdW1iZXIocm93LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgICAgIGlmICghbGFzdEdyaWRQbGFjZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtb3N0IHByb2JhYmx5IG5vdCBhIHJlc3VsdCByb3dcclxuICAgICAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhc3NpZ24gdG91cm5hbWVudCBpZiBkZWZpbmVkIChwb3NzaWJseSBzaG93aW5nIGFuIGV4dHJhY3QgZnJvbSBncmVhdGVyIHRhYmxlKVxyXG4gICAgICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQgfHwgMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBsYXN0R3JpZFBsYWNlbWVudCArIDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFzc3VtcHRpb246IGlmIHBsYWNlIGlzIG5vdCBwcm92aWRlZCB0aGVuIGl0J3MgYW4gZXggYWVxdW8gY2FzZSBidXRcclxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgYSBsb3dlciBwbGFjZSBub25ldGhlbGVzc1xyXG4gICAgICAgICAgICBpZiAoIXRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA/IGxhc3RUb3VybmFtZW50UGxhY2VtZW50IDogMTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG91cm5hbWVudFBsYWNlbWVudCA8PSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChncmlkUGxhY2VtZW50ID09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcnNlR2FtZXMocGxheWVyLCBjZWxscyk7XHJcblxyXG4gICAgICAgIHBsYXllci50b3VybmFtZW50UGxhY2UgPSB0b3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIHBsYXllci5vcHBvbmVudHMuc29ydCgoYSwgYikgPT4gYSA+IGIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICByZXN1bHRzW2dyaWRQbGFjZW1lbnRdID0gcGxheWVyO1xyXG5cclxuICAgICAgICBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgbGFzdEdyaWRQbGFjZW1lbnQgPSBncmlkUGxhY2VtZW50O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCBwYXJzZSBmcm9tICcuL3BhcnNlcic7XHJcbmltcG9ydCBjb252ZXJ0IGZyb20gJy4vcmF3MnRhYmxlJztcclxuaW1wb3J0IHsgYXNBcnJheSwgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvUmVzdWx0c0hpZ2hsaWdodGVyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIEdvUmVzdWx0c0hpZ2hsaWdodGVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIG1haW4gZWxlbWVudCBjb250YWluaW5nIHRhYmxlIHdpdGggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gLSBwbHVnaW4gc2V0dGluZ3NcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3MuY29sdW1uPTBdIC0gaW5kZXggb2YgdGhlIGNvbHVtblxyXG4gICAgICogd2hlcmUgdGhlIHNjcmlwdCBzaG91bGQgZXhwZWN0IHRvIGZpbmQgcGxheWVyJ3MgcGxhY2VtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLnJvdz0wXSAtIHN0YXJ0aW5nIHJvdyB3aXRoIHBsYXllcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucHJlZml4Q2xzPSdnby1yZXN1bHRzLSddIC0gY3NzIGNsYXNzIHByZWZpeFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5nYW1lQ2xzPSdnYW1lJ10gLSBnYW1lIGNlbGwgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jdXJyZW50Q2xzPSdjdXJyZW50J10gLSBzZWxlY3RlZCByb3cgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yZXN1bHRzXSAtIG1hcCB3aXRoIHBvc3NpYmxlIHJlc3VsdHMsIGJ5IGRlZmF1bHRcclxuICAgICAqIHN1cHBvcnRzIDQgb3B0aW9ucy4gUHJvdmlkZSB3aXRoIFwiY2xhc3NOYW1lXCIgLT4gXCJyZWdleHBcIiBwYXR0ZXJuLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLndvbj0nKFswLTldKylcXFxcKyddIC0gZGVmYXVsdCB3aW5uaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmxvc3Q9JyhbMC05XSspXFxcXC0nXSAtIGRlZmF1bHQgbG9zaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmppZ289JyhbMC05XSspPSddIC0gZGVmYXVsdCBkcmF3IHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLnVucmVzb2x2ZWQ9JyhbMC05XSspXFxcXD9dIC0gZGVmYXVsdCB1bnJlc29sdmVkIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yb3dUYWdzPSd0ciddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZSBzdHJpbmdcclxuICAgICAqIHdpdGggdGFncyByZXByZXNlbnRpbmcgcGxheWVycycgcm93c1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jZWxsVGFncz0ndGQsdGgnXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGVcclxuICAgICAqIHN0cmluZyB3aXRoIHRhZ3MgaG9sZGluZyBnYW1lIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgc2V0dGluZ3MpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NKGVsZW1lbnQpLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFByZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHRhYmxlID0gY29udmVydChlbGVtZW50LmlubmVySFRNTCwgc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG5cclxuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh0YWJsZSwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRhYmxlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgLy8gbm90IHN1cHBvcnRlZFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzTWFwKCk7XHJcbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy50YWJsZUNscyk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gdGhpcztcclxuICAgICAgICB0aGlzLnNob3dpbmdEZXRhaWxzID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIHBsYXllcnMgbWFwXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVBsYXllcnNNYXAoKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBwYXJzZSh0aGlzLmVsZW1lbnQsIHRoaXMuc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwbGFjZW1lbnQgaW4gdGhpcy5tYXApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KHBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKHRoaXMubWFwW3BsYWNlbWVudF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgdGhlIHJvdyBmb3Igc2VsZWN0ZWQgcGxheWVyIGFuZCBhIGNlbGwgd2l0aCBvcHBvbmVudHMgZ2FtZSBpZlxyXG4gICAgICogcHJvdmlkZWQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXSAtIHBsYXllcidzIHBsYWNlLCBzZWxlY3Rpb24gd2lsbCBiZSByZW1vdmVcclxuICAgICAqIGlmIG5vdCBwbGF5ZXIgaXMgZm91bmQgZm9yIGdpdmVuIHBsYWNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wcG9uZW50UGxhY2VdIC0gcGxheWVyJ3Mgb3Bwb25lbnQncyBwbGFjZSAtIHRvIG1hcmtcclxuICAgICAqIGNlbGxzIHdpdGggZ2FtZSBiZXR3ZWVuIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgKi9cclxuICAgIHNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSwgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuY3VycmVudENscztcclxuICAgICAgICBjb25zdCBnYW1lQ2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmdhbWVDbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGdhbWVDbHMpKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBjdXJyZW50Q2xzKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3dQbGFjZW1lbnQgPSBtYXJrZWRSb3cgPyBtYXJrZWRSb3cuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpIDogbnVsbDtcclxuICAgICAgICBjb25zdCBtYXJrZWRQbGF5ZXIgPSBtYXJrZWRSb3dQbGFjZW1lbnQgPyB0aGlzLm1hcFttYXJrZWRSb3dQbGFjZW1lbnRdIDogbnVsbDtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGFueSB2aXNpYmxlIGdhbWUgbWFya2luZ3NcclxuICAgICAgICBtYXJrZWRHYW1lcy5mb3JFYWNoKChnYW1lQ2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBnYW1lQ2VsbC5jbGFzc0xpc3QucmVtb3ZlKGdhbWVDbHMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1bm1hcmsgcGxheWVyIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgIGlmIChtYXJrZWRQbGF5ZXIgJiYgbWFya2VkUGxheWVyICE9PSBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyay5jYWxsKHRoaXMsIG1hcmtlZFBsYXllciwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgcGxheWVyIGlmIG5vdCBhbHJlYWR5IG1hcmtlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgcGxheWVyICE9PSBtYXJrZWRQbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyay5jYWxsKHRoaXMsIHBsYXllciwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIGFsbCB0aGUgZ2FtZXNcclxuICAgICAgICBpZiAodGhpcy5zaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcFtvcHBvbmVudF0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIGdhbWUgYmV0d2VlbiB0aGUgcGxheWVyIGFuZCB0aGUgb3Bwb25lbnRcclxuICAgICAgICB9IGVsc2UgaWYgKHBsYXllciAmJiBvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoZ2FtZUNscyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50UGxhY2VdLmdhbWVzW3BsYXllclBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoZ2FtZUNscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBtYXJrKHBsYXllciwgYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IGFjdGl2ZSA/ICdhZGQnIDogJ3JlbW92ZSc7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIucm93LmNsYXNzTGlzdFttZXRob2RdKGN1cnJlbnRDbHMpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudFBsYWNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXTtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudC5yb3cuY2xhc3NMaXN0W21ldGhvZF0odGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2xzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdG9yZXMgcHJvcGVyIG9yZGVyIG9mIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgcmVzdG9yZUZ1bGxSZXN1bHRzKCkge1xyXG4gICAgICAgIHRoaXMucGxheWVyc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChwbGF5ZXIpID0+IHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgIC5yZXZlcnNlKClcclxuICAgICAgICAgICAgLmZvckVhY2goKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwbGF5ZXIucm93LCBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nKTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICB0aGlzLnNob3dpbmdEZXRhaWxzID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93cyBkZXRhaWxzIGZvciBzZWxlY3RlZCBwbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcGxheWVyUGxhY2VdXHJcbiAgICAgKi9cclxuICAgIHNob3dEZXRhaWxzKHBsYXllclBsYWNlKSB7XHJcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5tYXBbcGxheWVyUGxhY2VdO1xyXG5cclxuICAgICAgICBpZiAoIXBsYXllcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYXJlbnQgPSBwbGF5ZXIucm93LnBhcmVudE5vZGU7XHJcbiAgICAgICAgbGV0IGFmdGVyID0gcGxheWVyLnJvdy5uZXh0U2libGluZztcclxuXHJcbiAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudFBsYWNlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgb3Bwb25lbnQucm93LnByb3Blck5leHRTaWJsaW5nID0gb3Bwb25lbnQucm93Lm5leHRTaWJsaW5nO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wcG9uZW50UGxhY2UgPCBwbGF5ZXJQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShvcHBvbmVudC5yb3csIHBsYXllci5yb3cpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShvcHBvbmVudC5yb3csIGFmdGVyKTtcclxuICAgICAgICAgICAgICAgIGFmdGVyID0gb3Bwb25lbnQucm93Lm5leHRTaWJsaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nRGV0YWlscyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RQbGF5ZXIocGxheWVyUGxhY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZHMgbW91c2VvdmVyIGFuZCBtb3VzZW91dCBldmVudHMgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBiaW5kRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5jbGlja2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IHBsYXllclBsYWNlbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwbGF5ZXIgcm93PyBubyBmdXJ0aGVyIHNlYXJjaCBpcyBuZWNlc3NhcnlcclxuICAgICAgICAgICAgICAgIGlmIChwbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJQbGFjZW1lbnQgPSBwbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBsYXN0VGFyZ2V0UG9zO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEZXRhaWxzKHBsYXllclBsYWNlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5wcm9wZXJOZXh0U2libGluZykge1xyXG4gICAgICAgICAgICAgICAgbGFzdFRhcmdldFBvcyA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlRnVsbFJlc3VsdHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RldGFpbHMocGxheWVyUGxhY2VtZW50KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0VGFyZ2V0UG9zID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVGdWxsUmVzdWx0cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQbGF5ZXIocGxheWVyUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhc3RUYXJnZXRQb3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIGxhc3RUYXJnZXRQb3M7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpZmYpID4gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoMCwgZGlmZik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5zaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudEdyaWRQbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyR3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2FtZSBjZWxsP1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50R3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50ID0gb3Bwb25lbnRHcmlkUGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllckdyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSBwbGF5ZXJHcmlkUGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXIsIG9wcG9uZW50KTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5zaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCAmJiB0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG5ldyBob3ZlcmVkIGVsZW1lbnQgaXMgb3V0c2lkZSB0aGUgdGFibGUgdGhlbiByZW1vdmUgYWxsXHJcbiAgICAgICAgICAgIC8vIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgaWYgKHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcigtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9SZXN1bHRzV2l0aFJlZ0V4cCB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIHJhdyByZXN1bHRzIHN0cmluZyBpbnRvIHRhYmxlIHdpdGggcm93cyBhbmQgY2VsbHMuXHJcbiAqIFJldHVybnMgbnVsbCBpZiBub3QgdmFsaWQgaW5wdXQuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByYXdSZXN1bHRzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnXVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5zdGFydGluZ1Jvdz0wXSAtIGluZm9ybXMgd2hlcmUgaXMgdGhlIGZpcnN0IHJvdyB3aXRoIHJlc3VsdHNcclxuICogQHBhcmFtIHtudW1iZXJ9IFtjb25maWcucGxhY2VDb2x1bW49MF0gLSBpbmZvcm1zIGluIHdoaWNoIGNvbHVtbiBpcyB0aGUgcGxhY2UgbG9jYXRlZFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yb3VuZHNDb2x1bW5zXSAtIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNvbHVtbnMgd2hlcmUgZ2FtZSByZXN1bHRzIGFyZSBsb2NhdGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLmNlbGxTZXBhcmF0b3I9J1tcXHQgXSsnXSAtIHNlcGFyYXRlZCB1c2VkIHRvIGRpdmlkZSByb3dzIGludG8gY2VsbHNcclxuICogQHBhcmFtIHtib29sZWFufSBbY29uZmlnLmpvaW5OYW1lcz10cnVlXSAtIGpvaW5zIHR3byBjb25zZWN1dGl2ZSBjZWxscyBhZnRlciB0aGUgcGxhY2UgY29sdW1uIGludG8gb25lIGNlbGxcclxuICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb252ZXJ0UmF3UmVzdWx0c1RvVGFibGUocmF3UmVzdWx0cywgY29uZmlnKSB7XHJcbiAgICBpZiAoIXJhd1Jlc3VsdHMpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIGNvbmZpZyk7XHJcbiAgICBjb25zdCBsaW5lcyA9IHJhd1Jlc3VsdHMuc3BsaXQoL1xcclxcbnxcXG4vKTtcclxuXHJcbiAgICBpZiAobGluZXMubGVuZ3RoIDw9IDIgJiYgIWxpbmVzWzBdICYmICFsaW5lc1sxXSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSB0b1Jlc3VsdHNXaXRoUmVnRXhwKHNldHRpbmdzLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcENvdW50ID0gcmVzdWx0c01hcC5sZW5ndGg7XHJcbiAgICBjb25zdCBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG5cclxuICAgIGNvbnN0IHJvd3MgPSBsaW5lc1xyXG4gICAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmVcclxuXHJcbiAgICAgICAgICAgIC8vIHByb2JhYmx5IHVuaGVhbHRoeSByZXBsYWNpbmcgc3BhY2UgaW4gcmFuayBpbiBvcmRlciB0byBtYWtlIHN1cmVcclxuICAgICAgICAgICAgLy8gdGhhdCBpdCB3b24ndCBiZSBicm9rZW4gaW50byB0d28gY2VsbHNcclxuICAgICAgICAgICAgLnJlcGxhY2UoLyhbMC05XSspXFxzKGRhbnxreXUpL2ksICckMV8kMicpXHJcblxyXG4gICAgICAgICAgICAvLyBzcGxpdCBsaW5lIHRvIGNlbGxzIChjb25zaWRlciB0YWJzIGFuZCBzcGFjZXMgYXMgc2VwYXJhdG9ycyBieSBkZWZhdWx0KVxyXG4gICAgICAgICAgICAuc3BsaXQobmV3IFJlZ0V4cChzZXR0aW5ncy5yb3dTZXBhcmF0b3IpKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGVtcHR5IGNlbGxzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGNlbGwpID0+IGNlbGwubGVuZ3RoID4gMClcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIC8vIGZpbHRlciBvdXQgZW1wdHkgcm93cyBvciByb3dzIHN0YXJ0aW5nIHdpdGggJzsnIChFR0QvRkZHIGNvbW1lbnQpXHJcbiAgICAgICAgLmZpbHRlcigoY2VsbHMpID0+IGNlbGxzLmxlbmd0aCA+IDAgJiYgY2VsbHNbMF0uaW5kZXhPZignOycpICE9PSAwKTtcclxuXHJcbiAgICBjb25zdCB0YWJsZVdpZHRoID0gcm93cy5yZWR1Y2UoKHByZXYsIGxpbmUpID0+IE1hdGgubWF4KHByZXYsIGxpbmUubGVuZ3RoKSwgMCk7XHJcbiAgICBjb25zdCB0YWJsZU1vZGlmaWVyID0gc2V0dGluZ3Muam9pbk5hbWVzID8gLTEgOiAwO1xyXG4gICAgY29uc3Qgam9pbk5hbWVQb3MgPSBzZXR0aW5ncy5wbGFjZUNvbHVtbiArIDE7XHJcblxyXG4gICAgbGV0IGdhbWVzSW5Db2x1bW5zID0gbnVsbDtcclxuXHJcbiAgICAvLyBpZiBjb2x1bW5zIHJvdW5kcyBhcmUgcHJvdmlkZWQgdGhlbiBjb252ZXJ0IG9ubHkgdGhlbVxyXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGdhbWVzSW5Db2x1bW5zID0gc2V0dGluZ3Mucm91bmRzQ29sdW1ucy5zcGxpdCgnLCcpLm1hcChOdW1iZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwcmV2aW91c1BsYWNlO1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgoY2VsbHMsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IGNlbGxzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKCF3aWR0aCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5kZXggPCBzZXR0aW5ncy5zdGFydGluZ1JvdyB8fCB3aWR0aCA8ICh0YWJsZVdpZHRoICsgdGFibGVNb2RpZmllcikpIHtcclxuICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2NvbHNwYW4nLCB0YWJsZVdpZHRoICsgdGFibGVNb2RpZmllcik7XHJcbiAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxscy5qb2luKCcgJyk7XHJcblxyXG4gICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIC0xKTtcclxuICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcGxhY2UgPSBwYXJzZUludChjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0sIDEwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc05hTihwbGFjZSkgJiYgIXByZXZpb3VzUGxhY2UpIHtcclxuICAgICAgICAgICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGxDb250ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgcHJldmlvdXNQbGFjZSB8fCBwbGFjZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5qb2luTmFtZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxscy5zcGxpY2Uoam9pbk5hbWVQb3MsIDIsIGAke2NlbGxzW2pvaW5OYW1lUG9zXX0gICR7Y2VsbHNbam9pbk5hbWVQb3MgKyAxXX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsQ29udGVudCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxsQ29udGVudC5yZXBsYWNlKC9fLywgJyAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFnYW1lc0luQ29sdW1ucyB8fCBnYW1lc0luQ29sdW1ucy5pbmRleE9mKGluZGV4KSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGxDb250ZW50Lm1hdGNoKHJlc3VsdHNNYXBbaV0ucmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50UGxhY2VtZW50ID0gbWF0Y2hbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnRzLnB1c2gob3Bwb25lbnRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5ULCBvcHBvbmVudFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCwgcmVzdWx0c01hcFtpXS5jbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAob3Bwb25lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRTLCBvcHBvbmVudHMuam9pbignLCcpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZpb3VzUGxhY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BsYWNlID0gMjtcclxuICAgICAgICAgICAgICAgIH0gIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUGxhY2UgKz0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dHB1dC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgb3V0cHV0LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5SRVNVTFRfVEFCTEUsICcnKTtcclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHNldHRpbmdzIG9mIHRoZSBwbHVnaW5cclxuICogQHR5cGUge3twcmVmaXhDbHM6IHN0cmluZywgc2hvd2luZ0RldGFpbHNDbHM6IHN0cmluZywgdGFibGVDbHM6IHN0cmluZywgZ2FtZUNsczogc3RyaW5nLCBjdXJyZW50Q2xzOiBzdHJpbmcsIHJlc3VsdHM6IHt3b246IHN0cmluZywgbG9zdDogc3RyaW5nLCBqaWdvOiBzdHJpbmcsIHVucmVzb2x2ZWQ6IHN0cmluZ30sIHN0YXJ0aW5nUm93OiBudW1iZXIsIHBsYWNlQ29sdW1uOiBudW1iZXIsIHJvdW5kc0NvbHVtbnM6IG51bGwsIHJvd1RhZ3M6IHN0cmluZywgY2VsbFRhZ3M6IHN0cmluZywgcm93U2VwYXJhdG9yOiBzdHJpbmcsIGhvdmVyaW5nOiBib29sZWFuLCBjbGlja2luZzogYm9vbGVhbn19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICAgIHByZWZpeENsczogJ2dvLXJlc3VsdHMtJyxcclxuICAgIHNob3dpbmdEZXRhaWxzQ2xzOidzaG93aW5nLWRldGFpbHMnLFxyXG4gICAgdGFibGVDbHM6ICd0YWJsZScsXHJcbiAgICBnYW1lQ2xzOiAnZ2FtZScsXHJcbiAgICBjdXJyZW50Q2xzOiAnY3VycmVudCcsXHJcblxyXG4gICAgcmVzdWx0czoge1xyXG4gICAgICAgIHdvbjogJyhbMC05XSspXFxcXCsnLFxyXG4gICAgICAgIGxvc3Q6ICcoWzAtOV0rKVxcXFwtJyxcclxuICAgICAgICBqaWdvOiAnKFswLTldKyk9JyxcclxuICAgICAgICB1bnJlc29sdmVkOiAnKFswLTldKylcXFxcPydcclxuICAgIH0sXHJcblxyXG4gICAgc3RhcnRpbmdSb3c6IDAsXHJcbiAgICBwbGFjZUNvbHVtbjogMCxcclxuICAgIHJvdW5kc0NvbHVtbnM6IG51bGwsXHJcblxyXG4gICAgcm93VGFnczogJ3RyJyxcclxuICAgIGNlbGxUYWdzOiAndGQsdGgnLFxyXG4gICAgcm93U2VwYXJhdG9yOiAnW1xcdCBdKycsXHJcbiAgICBqb2luTmFtZXM6IHRydWUsXHJcblxyXG4gICAgaG92ZXJpbmc6IHRydWUsXHJcbiAgICBjbGlja2luZzogdHJ1ZVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5hbWVzIG9mIGF0dHJpYnV0ZXMgdXNlZCBpbiB0aGlzIHBsdWdpblxyXG4gKiBAdHlwZSB7e1JFU1VMVF9UQUJMRTogc3RyaW5nLCBTRVRUSU5HX1NUQVJUSU5HX1JPVzogc3RyaW5nLCBTRVRUSU5HX1BMQUNFX0NPTFVNTjogc3RyaW5nLCBTRVRUSU5HX1JPVU5EU19DT0xVTU5TOiBzdHJpbmcsIFBMQVlFUl9QTEFDRU1FTlQ6IHN0cmluZywgT1BQT05FTlRfUExBQ0VNRU5UOiBzdHJpbmcsIEdBTUVfUkVTVUxUOiBzdHJpbmd9fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERPTV9BVFRSSUJVVEVTID0ge1xyXG4gICAgUkVTVUxUX1RBQkxFOiAnZGF0YS1nby1yZXN1bHRzJyxcclxuICAgIFNFVFRJTkdfU1RBUlRJTkdfUk9XOiAnZGF0YS1nby1zdGFydGluZy1yb3cnLFxyXG4gICAgU0VUVElOR19QTEFDRV9DT0xVTU46ICdkYXRhLWdvLXBsYWNlLWNvbCcsXHJcbiAgICBTRVRUSU5HX1JPVU5EU19DT0xVTU5TOiAnZGF0YS1nby1yb3VuZHMtY29scycsXHJcbiAgICBTRVRUSU5HX0NMSUNLSU5HOiAnZGF0YS1nby1jbGlja2luZycsXHJcbiAgICBTRVRUSU5HX0hPVkVSSU5HOiAnZGF0YS1nby1ob3ZlcmluZycsXHJcbiAgICBQTEFZRVJfUExBQ0VNRU5UOiAnZGF0YS1nby1wbGFjZScsXHJcbiAgICBPUFBPTkVOVF9QTEFDRU1FTlQ6ICdkYXRhLWdvLW9wcG9uZW50JyxcclxuICAgIE9QUE9ORU5UUzogJ2RhdGEtZ28tb3Bwb25lbnRzJyxcclxuICAgIEdBTUVfUkVTVUxUOiAnZGF0YS1nby1yZXN1bHQnXHJcbn07XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBtYXAgb2YgcG9zc2libGUgcmVzdWx0cyBpbnRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCByZWdleHAgc3RyaW5nXHJcbiAqIGNvbnZlcnRlZCBpbnRvIFJlZ0V4cCBvYmplY3RzLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzdWx0c1xyXG4gKiBAcmV0dXJucyB7QXJyYXkuPHtjbHM6IHN0cmluZywgcmVnZXhwOiBSZWdFeHB9Pn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1Jlc3VsdHNXaXRoUmVnRXhwKHJlc3VsdHMpIHtcclxuICAgIGNvbnN0IG1hcCA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGNscyBpbiByZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMuaGFzT3duUHJvcGVydHkoY2xzKSkge1xyXG4gICAgICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjbHMsXHJcbiAgICAgICAgICAgICAgICByZWdleHA6IG5ldyBSZWdFeHAocmVzdWx0c1tjbHNdKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0aGUgZWxlbWVudCBmb3IgMyBhdHRyaWJ1dGVzIGFuZCByZXR1cm5zIG9iamVjdCB3aXRoIHNldCBhcHByb3ByaWF0ZVxyXG4gKiB2YWx1ZXNcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGVcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00odGFibGUpIHtcclxuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19QTEFDRV9DT0xVTU4pKSB7XHJcbiAgICAgICAgb3V0cHV0LnBsYWNlQ29sdW1uID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1BMQUNFX0NPTFVNTikpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19TVEFSVElOR19ST1cpKSB7XHJcbiAgICAgICAgb3V0cHV0LnN0YXJ0aW5nUm93ID0gTnVtYmVyKHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1NUQVJUSU5HX1JPVykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19ST1VORFNfQ09MVU1OUykpIHtcclxuICAgICAgICBvdXRwdXQucm91bmRzQ29sdW1ucyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1JPVU5EU19DT0xVTU5TKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpKSB7XHJcbiAgICAgICAgb3V0cHV0LmNsaWNraW5nID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfQ0xJQ0tJTkcpICE9PSAnZmFsc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykpIHtcclxuICAgICAgICBvdXRwdXQuaG92ZXJpbmcgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19IT1ZFUklORykgIT09ICdmYWxzZSc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGFycmF5LWxpa2Ugb2JqZWN0cyAoc3VjaCBhcyBhcmd1bWVudHMgb3Igbm9kZSBsaXN0cykgaW50byBhbiBhcnJheVxyXG4gKiBAcGFyYW0geyp9IGFycmF5TGlrZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFQ+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzQXJyYXkoYXJyYXlMaWtlKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCBjb250YWluaW5nIGtleXMgb25seSBmcm9tIGRlZmF1bHRPYmogYnV0IHZhbHVlcyBhcmUgdGFrZW5cclxuICogZnJvbSBpZiBleGlzdCAoc3RhcnRpbmcgZnJvbSB0aGUgbGFzdCBvYmplY3QgcHJvdmlkZWQpXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0T2JqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cyhkZWZhdWx0T2JqLCAuLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCBvdmVycmlkZXMgPSBvYmplY3RzXHJcbiAgICAgICAgLmZpbHRlcigob2JqKSA9PiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JylcclxuICAgICAgICAucmV2ZXJzZSgpO1xyXG5cclxuICAgIGNvbnN0IGNvdW50ID0gb3ZlcnJpZGVzLmxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG1haW5Mb29wOiBmb3IgKGxldCBrZXkgaW4gZGVmYXVsdE9iaikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAob3ZlcnJpZGVzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb3ZlcnJpZGVzW2ldW2tleV07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBtYWluTG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzdWx0W2tleV0gPSBkZWZhdWx0T2JqW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCB0aGF0IGhhcyBtZXJnZWQgcHJvcGVydGllcyBmcm9tIGFsbCBwcm92aWRlZCBvYmplY3RzLlxyXG4gKiBMYXRlc3QgYXJndW1lbnRzIG92ZXJyaWRlcyB0aGUgZWFybGllciB2YWx1ZXMuXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lKC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIG9iamVjdHMuZm9yRWFjaCgob2JqZWN0KSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xyXG4gICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59Il19
(1)
});
