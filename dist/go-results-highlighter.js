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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvZmFrZV80YTBiM2UwLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvcGFyc2VyLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvcGx1Z2luLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvcmF3MnRhYmxlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvc2V0dGluZ3MuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7Ozs7Ozs7c0JBRW9CLFVBQVU7Ozs7d0JBQ1osWUFBWTs7cUJBQ25CLFNBQVM7O0FBRWpDLFNBQVMsVUFBVSxHQUFHO0FBQ2xCLHdCQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsT0FBSyx5QkFBZSxZQUFZLE9BQUksQ0FBQyxDQUNqRSxPQUFPLENBQUMsVUFBQyxPQUFPO2VBQUssd0JBQXlCLE9BQU8sQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNoRTs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOztBQUVELElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQy9CLFVB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b3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBHb1Jlc3VsdHNIaWdobGlnaHRlciBmcm9tICcuL3BsdWdpbic7XHJcbmltcG9ydCB7IERPTV9BVFRSSUJVVEVTIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IGFzQXJyYXkgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XHJcbiAgICBhc0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFske0RPTV9BVFRSSUJVVEVTLlJFU1VMVF9UQUJMRX1dYCkpXHJcbiAgICAgICAgLmZvckVhY2goKHRhYmxlRWwpID0+IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZUVsKSk7XHJcbn1cclxuXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbn0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZSwgZmFsc2UpO1xyXG59XHJcblxyXG5pZiAodHlwZW9mIGpRdWVyeSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGpRdWVyeS5mbi5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZXIgPSBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIoZWxlbWVudCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAkKGhpZ2hsaWdodGVyLmVsZW1lbnQpLmRhdGEoJ0dvUmVzdWx0c0hpZ2hsaWdodGVyJywgaGlnaGxpZ2h0ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgR29SZXN1bHRzSGlnaGxpZ2h0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgYXNBcnJheSwgZGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHRvUmVzdWx0c1dpdGhSZWdFeHAgfSBmcm9tICcuL3NldHRpbmdzJztcclxuXHJcbmZ1bmN0aW9uIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIHBsYWNlbWVudCkge1xyXG4gICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCBwbGFjZW1lbnQpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhdmVyc2UgcHJvdmlkZWQgdGFibGUgYW5kIGNyZWF0ZSByZXN1bHRzIG1hcFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZSAtIHRhYmxlIHJlc3VsdHMgY29udGFpbmVyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnXSAtIHNldHRpbmdzIGZvciBwYXJzZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcucm93VGFnc11cclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuY2VsbFRhZ3NdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnJlc3VsdHNdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnBsYWNlQ29sdW1uXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5yb3VuZHNDb2x1bW5zXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW2NvbmZpZy5zdGFydGluZ1Jvd11cclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlKHRhYmxlLCBjb25maWcpIHtcclxuICAgIGNvbnN0IHNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgY29uZmlnKTtcclxuICAgIGNvbnN0IHJvd3MgPSBhc0FycmF5KHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3Mucm93VGFncykpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IHRvUmVzdWx0c1dpdGhSZWdFeHAoc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwQ291bnQgPSByZXN1bHRzTWFwLmxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZUdhbWVzKHBsYXllciwgY2VsbHMpIHtcclxuICAgICAgICAvLyBpZiBjb2x1bW5zIHJvdW5kcyBhcmUgcHJvdmlkZWQgdGhlbiBwYXJzZSBvbmx5IHRoZW1cclxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLnJvdW5kc0NvbHVtbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGNlbGxzID0gc2V0dGluZ3Mucm91bmRzQ29sdW1uc1xyXG4gICAgICAgICAgICAgICAgLnNwbGl0KCcsJylcclxuICAgICAgICAgICAgICAgIC5tYXAoKHJvdW5kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNlbGxzW051bWJlcihyb3VuZCldO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudFBsYWNlO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0Q2xzO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmIChjZWxsLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCkgJiYgY2VsbC5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKSkge1xyXG4gICAgICAgICAgICAgICAgb3Bwb25lbnRQbGFjZSA9IE51bWJlcihjZWxsLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdENscyA9IGNlbGwuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxUKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHNNYXBDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gY2VsbC50ZXh0Q29udGVudC5tYXRjaChyZXN1bHRzTWFwW2ldLnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBvcHBvbmVudFBsYWNlID0gTnVtYmVyKG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRDbHMgPSByZXN1bHRzTWFwW2ldLmNscztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5ULCBvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5HQU1FX1JFU1VMVCwgcmVzdWx0c01hcFtpXS5jbHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdID0ge1xyXG4gICAgICAgICAgICAgICAgY2VsbCxcclxuICAgICAgICAgICAgICAgIGNsczogcmVzdWx0Q2xzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLnB1c2gob3Bwb25lbnRQbGFjZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgbGV0IGxhc3RHcmlkUGxhY2VtZW50O1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnN0YXJ0aW5nUm93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXNBcnJheShyb3cucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5jZWxsVGFncykpO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gZGVmYXVsdCBwbGFjZVxyXG4gICAgICAgIGxldCBncmlkUGxhY2VtZW50ID0gLTE7XHJcblxyXG4gICAgICAgIC8vIG5vIGNlbGxzPyB1bmxpa2VseSB0byBiZSBhIHJlc3VsdCByb3dcclxuICAgICAgICBpZiAoIWNlbGxzLmxlbmd0aCB8fCAhY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dKSB7XHJcbiAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG91cm5hbWVudFBsYWNlbWVudCA9IHBhcnNlSW50KGNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB7XHJcbiAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZTogLTEsXHJcbiAgICAgICAgICAgIHJvdyxcclxuICAgICAgICAgICAgZ2FtZXM6IHt9LFxyXG4gICAgICAgICAgICBvcHBvbmVudHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHJvdy5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkpIHtcclxuICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IE51bWJlcihyb3cuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG5vIHBsYXllciBoYXMgYmVlbiBtYXBwZWRcclxuICAgICAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1vc3QgcHJvYmFibHkgbm90IGEgcmVzdWx0IHJvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHRvdXJuYW1lbnRQbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiB0b3VybmFtZW50IGlmIGRlZmluZWQgKHBvc3NpYmx5IHNob3dpbmcgYW4gZXh0cmFjdCBmcm9tIGdyZWF0ZXIgdGFibGUpXHJcbiAgICAgICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudCB8fCAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IGxhc3RHcmlkUGxhY2VtZW50ICsgMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYXNzdW1wdGlvbjogaWYgcGxhY2UgaXMgbm90IHByb3ZpZGVkIHRoZW4gaXQncyBhbiBleCBhZXF1byBjYXNlIGJ1dFxyXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHNldCBhIGxvd2VyIHBsYWNlIG5vbmV0aGVsZXNzXHJcbiAgICAgICAgICAgIGlmICghdG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID8gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgOiAxO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b3VybmFtZW50UGxhY2VtZW50IDw9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdyaXRlR3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdyaWRQbGFjZW1lbnQgPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyc2VHYW1lcyhwbGF5ZXIsIGNlbGxzKTtcclxuXHJcbiAgICAgICAgcGxheWVyLnRvdXJuYW1lbnRQbGFjZSA9IHRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgcGxheWVyLm9wcG9uZW50cy5zb3J0KChhLCBiKSA9PiBhID4gYiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIHJlc3VsdHNbZ3JpZFBsYWNlbWVudF0gPSBwbGF5ZXI7XHJcblxyXG4gICAgICAgIGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBsYXN0R3JpZFBsYWNlbWVudCA9IGdyaWRQbGFjZW1lbnQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00gfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHBhcnNlIGZyb20gJy4vcGFyc2VyJztcclxuaW1wb3J0IGNvbnZlcnQgZnJvbSAnLi9yYXcydGFibGUnO1xyXG5pbXBvcnQgeyBhc0FycmF5LCBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29SZXN1bHRzSGlnaGxpZ2h0ZXIge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgR29SZXN1bHRzSGlnaGxpZ2h0ZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gbWFpbiBlbGVtZW50IGNvbnRhaW5pbmcgdGFibGUgd2l0aCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzXSAtIHBsdWdpbiBzZXR0aW5nc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5jb2x1bW49MF0gLSBpbmRleCBvZiB0aGUgY29sdW1uXHJcbiAgICAgKiB3aGVyZSB0aGUgc2NyaXB0IHNob3VsZCBleHBlY3QgdG8gZmluZCBwbGF5ZXIncyBwbGFjZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3Mucm93PTBdIC0gc3RhcnRpbmcgcm93IHdpdGggcGxheWVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5wcmVmaXhDbHM9J2dvLXJlc3VsdHMtJ10gLSBjc3MgY2xhc3MgcHJlZml4XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmdhbWVDbHM9J2dhbWUnXSAtIGdhbWUgY2VsbCBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmN1cnJlbnRDbHM9J2N1cnJlbnQnXSAtIHNlbGVjdGVkIHJvdyBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzLnJlc3VsdHNdIC0gbWFwIHdpdGggcG9zc2libGUgcmVzdWx0cywgYnkgZGVmYXVsdFxyXG4gICAgICogc3VwcG9ydHMgNCBvcHRpb25zLiBQcm92aWRlIHdpdGggXCJjbGFzc05hbWVcIiAtPiBcInJlZ2V4cFwiIHBhdHRlcm4uXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMud29uPScoWzAtOV0rKVxcXFwrJ10gLSBkZWZhdWx0IHdpbm5pbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMubG9zdD0nKFswLTldKylcXFxcLSddIC0gZGVmYXVsdCBsb3NpbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMuamlnbz0nKFswLTldKyk9J10gLSBkZWZhdWx0IGRyYXcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMudW5yZXNvbHZlZD0nKFswLTldKylcXFxcP10gLSBkZWZhdWx0IHVucmVzb2x2ZWQgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJvd1RhZ3M9J3RyJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlIHN0cmluZ1xyXG4gICAgICogd2l0aCB0YWdzIHJlcHJlc2VudGluZyBwbGF5ZXJzJyByb3dzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmNlbGxUYWdzPSd0ZCx0aCddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZVxyXG4gICAgICogc3RyaW5nIHdpdGggdGFncyBob2xkaW5nIGdhbWUgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCByZWFkVGFibGVTZXR0aW5nc0Zyb21ET00oZWxlbWVudCksIHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MUHJlRWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgdGFibGUgPSBjb252ZXJ0KGVsZW1lbnQuaW5uZXJIVE1MLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcblxyXG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRhYmxlLCBlbGVtZW50KTtcclxuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGFibGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAvLyBub3Qgc3VwcG9ydGVkXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVBsYXllcnNNYXAoKTtcclxuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnRhYmxlQ2xzKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgcGxheWVycyBtYXBcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUGxheWVyc01hcCgpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IHBhcnNlKHRoaXMuZWxlbWVudCwgdGhpcy5zZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsYWNlbWVudCBpbiB0aGlzLm1hcCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkocGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2godGhpcy5tYXBbcGxhY2VtZW50XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyB0aGUgcm93IGZvciBzZWxlY3RlZCBwbGF5ZXIgYW5kIGEgY2VsbCB3aXRoIG9wcG9uZW50cyBnYW1lIGlmXHJcbiAgICAgKiBwcm92aWRlZC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcGxheWVyUGxhY2VdIC0gcGxheWVyJ3MgcGxhY2UsIHNlbGVjdGlvbiB3aWxsIGJlIHJlbW92ZVxyXG4gICAgICogaWYgbm90IHBsYXllciBpcyBmb3VuZCBmb3IgZ2l2ZW4gcGxhY2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3Bwb25lbnRQbGFjZV0gLSBwbGF5ZXIncyBvcHBvbmVudCdzIHBsYWNlIC0gdG8gbWFya1xyXG4gICAgICogY2VsbHMgd2l0aCBnYW1lIGJldHdlZW4gcGxheWVyIGFuZCB0aGUgb3Bwb25lbnRcclxuICAgICAqL1xyXG4gICAgc2VsZWN0UGxheWVyKHBsYXllclBsYWNlLCBvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudENscyA9IHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5jdXJyZW50Q2xzO1xyXG4gICAgICAgIGNvbnN0IGdhbWVDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuZ2FtZUNscztcclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5tYXBbcGxheWVyUGxhY2VdO1xyXG5cclxuICAgICAgICBjb25zdCBtYXJrZWRHYW1lcyA9IGFzQXJyYXkodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgZ2FtZUNscykpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvdyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGN1cnJlbnRDbHMpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvd1BsYWNlbWVudCA9IG1hcmtlZFJvdyA/IG1hcmtlZFJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFBsYXllciA9IG1hcmtlZFJvd1BsYWNlbWVudCA/IHRoaXMubWFwW21hcmtlZFJvd1BsYWNlbWVudF0gOiBudWxsO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgYW55IHZpc2libGUgZ2FtZSBtYXJraW5nc1xyXG4gICAgICAgIG1hcmtlZEdhbWVzLmZvckVhY2goKGdhbWVDZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGdhbWVDZWxsLmNsYXNzTGlzdC5yZW1vdmUoZ2FtZUNscyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgbWFya2VkUGxheWVyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBwbGF5ZXIgaWYgbm90IGFscmVhZHkgbWFya2VkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBwbGF5ZXIgIT09IG1hcmtlZFBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgcGxheWVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgYWxsIHRoZSBnYW1lc1xyXG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50XS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgZ2FtZSBiZXR3ZWVuIHRoZSBwbGF5ZXIgYW5kIHRoZSBvcHBvbmVudFxyXG4gICAgICAgIH0gZWxzZSBpZiAocGxheWVyICYmIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hcmsocGxheWVyLCBhY3RpdmUpIHtcclxuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0W21ldGhvZF0oY3VycmVudENscyk7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50UGxhY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3RbbWV0aG9kXSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jbHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN0b3JlcyBwcm9wZXIgb3JkZXIgb2YgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICByZXN0b3JlRnVsbFJlc3VsdHMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHBsYXllcikgPT4gcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZylcclxuICAgICAgICAgICAgLnJldmVyc2UoKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBsYXllci5yb3csIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3Muc2hvd2luZ0RldGFpbHNDbHMpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIGRldGFpbHMgZm9yIHNlbGVjdGVkIHBsYXllclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtwbGF5ZXJQbGFjZV1cclxuICAgICAqL1xyXG4gICAgc2hvd0RldGFpbHMocGxheWVyUGxhY2UpIHtcclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcblxyXG4gICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHBsYXllci5yb3cucGFyZW50Tm9kZTtcclxuICAgICAgICBsZXQgYWZ0ZXIgPSBwbGF5ZXIucm93Lm5leHRTaWJsaW5nO1xyXG5cclxuICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50UGxhY2UpID0+IHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICBvcHBvbmVudC5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBvcHBvbmVudC5yb3cubmV4dFNpYmxpbmc7XHJcblxyXG4gICAgICAgICAgICBpZiAob3Bwb25lbnRQbGFjZSA8IHBsYXllclBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgcGxheWVyLnJvdyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgYWZ0ZXIpO1xyXG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBvcHBvbmVudC5yb3cubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICB0aGlzLnNob3dpbmdEZXRhaWxzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyUGxhY2VtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBsYWNlbWVudCA9IHBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGxhc3RUYXJnZXRQb3M7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RldGFpbHMocGxheWVyUGxhY2VtZW50KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LnByb3Blck5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0VGFyZ2V0UG9zID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVGdWxsUmVzdWx0cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RGV0YWlscyhwbGF5ZXJQbGFjZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhc3RUYXJnZXRQb3MgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUZ1bGxSZXN1bHRzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFzdFRhcmdldFBvcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCBkaWZmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gZmV0Y2ggaW5mb3JtYXRpb24gYWJvdXQgaG92ZXJlZCBlbGVtZW50XHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50R3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXJHcmlkUGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnYW1lIGNlbGw/XHJcbiAgICAgICAgICAgICAgICBpZiAob3Bwb25lbnRHcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQgPSBvcHBvbmVudEdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcGxheWVyIHJvdz8gbm8gZnVydGhlciBzZWFyY2ggaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyR3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllciA9IHBsYXllckdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllciwgb3Bwb25lbnQpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50ICYmIHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgbmV3IGhvdmVyZWQgZWxlbWVudCBpcyBvdXRzaWRlIHRoZSB0YWJsZSB0aGVuIHJlbW92ZSBhbGxcclxuICAgICAgICAgICAgLy8gc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuR29SZXN1bHRzSGlnaGxpZ2h0ZXIuREVGQVVMVF9TRVRUSU5HUyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1Jlc3VsdHNXaXRoUmVnRXhwIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG4vKipcclxuICogQ29udmVydHMgcmF3IHJlc3VsdHMgc3RyaW5nIGludG8gdGFibGUgd2l0aCByb3dzIGFuZCBjZWxscy5cclxuICogUmV0dXJucyBudWxsIGlmIG5vdCB2YWxpZCBpbnB1dC5cclxuICogQHBhcmFtIHtzdHJpbmd9IHJhd1Jlc3VsdHNcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLnN0YXJ0aW5nUm93PTBdIC0gaW5mb3JtcyB3aGVyZSBpcyB0aGUgZmlyc3Qgcm93IHdpdGggcmVzdWx0c1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5wbGFjZUNvbHVtbj0wXSAtIGluZm9ybXMgaW4gd2hpY2ggY29sdW1uIGlzIHRoZSBwbGFjZSBsb2NhdGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdIC0gY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY29sdW1ucyB3aGVyZSBnYW1lIHJlc3VsdHMgYXJlIGxvY2F0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuY2VsbFNlcGFyYXRvcj0nW1xcdCBdKyddIC0gc2VwYXJhdGVkIHVzZWQgdG8gZGl2aWRlIHJvd3MgaW50byBjZWxsc1xyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maWcuam9pbk5hbWVzPXRydWVdIC0gam9pbnMgdHdvIGNvbnNlY3V0aXZlIGNlbGxzIGFmdGVyIHRoZSBwbGFjZSBjb2x1bW4gaW50byBvbmUgY2VsbFxyXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8bnVsbH1cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnZlcnRSYXdSZXN1bHRzVG9UYWJsZShyYXdSZXN1bHRzLCBjb25maWcpIHtcclxuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgaWYgKCFyYXdSZXN1bHRzKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIGNvbmZpZyk7XHJcbiAgICBjb25zdCBsaW5lcyA9IHJhd1Jlc3VsdHMuc3BsaXQoL1xcclxcbnxcXG4vKTtcclxuXHJcbiAgICBpZiAobGluZXMubGVuZ3RoIDw9IDIgJiYgIWxpbmVzWzBdICYmICFsaW5lc1sxXSkge1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IHRvUmVzdWx0c1dpdGhSZWdFeHAoc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwQ291bnQgPSByZXN1bHRzTWFwLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCByb3dzID0gbGluZXNcclxuICAgICAgICAubWFwKChsaW5lKSA9PiBsaW5lXHJcblxyXG4gICAgICAgICAgICAvLyBwcm9iYWJseSB1bmhlYWx0aHkgcmVwbGFjaW5nIHNwYWNlIGluIHJhbmsgaW4gb3JkZXIgdG8gbWFrZSBzdXJlXHJcbiAgICAgICAgICAgIC8vIHRoYXQgaXQgd29uJ3QgYmUgYnJva2VuIGludG8gdHdvIGNlbGxzXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8oWzAtOV0rKVxccyhkYW58a3l1KS9pLCAnJDFfJDInKVxyXG5cclxuICAgICAgICAgICAgLy8gc3BsaXQgbGluZSB0byBjZWxscyAoY29uc2lkZXIgdGFicyBhbmQgc3BhY2VzIGFzIHNlcGFyYXRvcnMgYnkgZGVmYXVsdClcclxuICAgICAgICAgICAgLnNwbGl0KG5ldyBSZWdFeHAoc2V0dGluZ3Mucm93U2VwYXJhdG9yKSlcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBlbXB0eSBjZWxsc1xyXG4gICAgICAgICAgICAuZmlsdGVyKChjZWxsKSA9PiBjZWxsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICAvLyBmaWx0ZXIgb3V0IGVtcHR5IHJvd3Mgb3Igcm93cyBzdGFydGluZyB3aXRoICc7JyAoRUdEL0ZGRyBjb21tZW50KVxyXG4gICAgICAgIC5maWx0ZXIoKGNlbGxzKSA9PiBjZWxscy5sZW5ndGggPiAwICYmIGNlbGxzWzBdLmluZGV4T2YoJzsnKSAhPT0gMCk7XHJcblxyXG4gICAgY29uc3QgdGFibGVXaWR0aCA9IHJvd3MucmVkdWNlKChwcmV2LCBsaW5lKSA9PiBNYXRoLm1heChwcmV2LCBsaW5lLmxlbmd0aCksIDApO1xyXG4gICAgY29uc3QgdGFibGVNb2RpZmllciA9IHNldHRpbmdzLmpvaW5OYW1lcyA/IC0xIDogMDtcclxuICAgIGNvbnN0IGpvaW5OYW1lUG9zID0gc2V0dGluZ3MucGxhY2VDb2x1bW4gKyAxO1xyXG5cclxuICAgIGxldCBnYW1lc0luQ29sdW1ucyA9IG51bGw7XHJcblxyXG4gICAgLy8gaWYgY29sdW1ucyByb3VuZHMgYXJlIHByb3ZpZGVkIHRoZW4gY29udmVydCBvbmx5IHRoZW1cclxuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBnYW1lc0luQ29sdW1ucyA9IHNldHRpbmdzLnJvdW5kc0NvbHVtbnMuc3BsaXQoJywnKS5tYXAoTnVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcHJldmlvdXNQbGFjZTtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKGNlbGxzLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSBjZWxscy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghd2lkdGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cgfHwgd2lkdGggPCAodGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpKSB7XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdjb2xzcGFuJywgdGFibGVXaWR0aCArIHRhYmxlTW9kaWZpZXIpO1xyXG4gICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbHMuam9pbignICcpO1xyXG5cclxuICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCAtMSk7XHJcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLCAxMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNOYU4ocGxhY2UpICYmICFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsQ29udGVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIC0xKTtcclxuICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHByZXZpb3VzUGxhY2UgfHwgcGxhY2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muam9pbk5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbHMuc3BsaWNlKGpvaW5OYW1lUG9zLCAyLCBgJHtjZWxsc1tqb2luTmFtZVBvc119ICAke2NlbGxzW2pvaW5OYW1lUG9zICsgMV19YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbENvbnRlbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gY2VsbENvbnRlbnQucmVwbGFjZSgvXy8sICcgJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZ2FtZXNJbkNvbHVtbnMgfHwgZ2FtZXNJbkNvbHVtbnMuaW5kZXhPZihpbmRleCkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHNNYXBDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsQ29udGVudC5tYXRjaChyZXN1bHRzTWFwW2ldLnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudFBsYWNlbWVudCA9IG1hdGNoWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wcG9uZW50cy5wdXNoKG9wcG9uZW50UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCwgb3Bwb25lbnRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQsIHJlc3VsdHNNYXBbaV0uY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UUywgb3Bwb25lbnRzLmpvaW4oJywnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2aW91c1BsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQbGFjZSA9IDI7XHJcbiAgICAgICAgICAgICAgICB9ICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1BsYWNlICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRwdXQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH0pO1xyXG5cclxuICAgIG91dHB1dC5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUkVTVUxUX1RBQkxFLCAnJyk7XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHt7cHJlZml4Q2xzOiBzdHJpbmcsIHNob3dpbmdEZXRhaWxzQ2xzOiBzdHJpbmcsIHRhYmxlQ2xzOiBzdHJpbmcsIGdhbWVDbHM6IHN0cmluZywgY3VycmVudENsczogc3RyaW5nLCByZXN1bHRzOiB7d29uOiBzdHJpbmcsIGxvc3Q6IHN0cmluZywgamlnbzogc3RyaW5nLCB1bnJlc29sdmVkOiBzdHJpbmd9LCBzdGFydGluZ1JvdzogbnVtYmVyLCBwbGFjZUNvbHVtbjogbnVtYmVyLCByb3VuZHNDb2x1bW5zOiBudWxsLCByb3dUYWdzOiBzdHJpbmcsIGNlbGxUYWdzOiBzdHJpbmcsIHJvd1NlcGFyYXRvcjogc3RyaW5nLCBob3ZlcmluZzogYm9vbGVhbiwgY2xpY2tpbmc6IGJvb2xlYW59fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgICBwcmVmaXhDbHM6ICdnby1yZXN1bHRzLScsXHJcbiAgICBzaG93aW5nRGV0YWlsc0Nsczonc2hvd2luZy1kZXRhaWxzJyxcclxuICAgIHRhYmxlQ2xzOiAndGFibGUnLFxyXG4gICAgZ2FtZUNsczogJ2dhbWUnLFxyXG4gICAgY3VycmVudENsczogJ2N1cnJlbnQnLFxyXG5cclxuICAgIHJlc3VsdHM6IHtcclxuICAgICAgICB3b246ICcoWzAtOV0rKVxcXFwrJyxcclxuICAgICAgICBsb3N0OiAnKFswLTldKylcXFxcLScsXHJcbiAgICAgICAgamlnbzogJyhbMC05XSspPScsXHJcbiAgICAgICAgdW5yZXNvbHZlZDogJyhbMC05XSspXFxcXD8nXHJcbiAgICB9LFxyXG5cclxuICAgIHN0YXJ0aW5nUm93OiAwLFxyXG4gICAgcGxhY2VDb2x1bW46IDAsXHJcbiAgICByb3VuZHNDb2x1bW5zOiBudWxsLFxyXG5cclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJyxcclxuICAgIHJvd1NlcGFyYXRvcjogJ1tcXHQgXSsnLFxyXG4gICAgam9pbk5hbWVzOiB0cnVlLFxyXG5cclxuICAgIGhvdmVyaW5nOiB0cnVlLFxyXG4gICAgY2xpY2tpbmc6IHRydWVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBOYW1lcyBvZiBhdHRyaWJ1dGVzIHVzZWQgaW4gdGhpcyBwbHVnaW5cclxuICogQHR5cGUge3tSRVNVTFRfVEFCTEU6IHN0cmluZywgU0VUVElOR19TVEFSVElOR19ST1c6IHN0cmluZywgU0VUVElOR19QTEFDRV9DT0xVTU46IHN0cmluZywgU0VUVElOR19ST1VORFNfQ09MVU1OUzogc3RyaW5nLCBQTEFZRVJfUExBQ0VNRU5UOiBzdHJpbmcsIE9QUE9ORU5UX1BMQUNFTUVOVDogc3RyaW5nLCBHQU1FX1JFU1VMVDogc3RyaW5nfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBET01fQVRUUklCVVRFUyA9IHtcclxuICAgIFJFU1VMVF9UQUJMRTogJ2RhdGEtZ28tcmVzdWx0cycsXHJcbiAgICBTRVRUSU5HX1NUQVJUSU5HX1JPVzogJ2RhdGEtZ28tc3RhcnRpbmctcm93JyxcclxuICAgIFNFVFRJTkdfUExBQ0VfQ09MVU1OOiAnZGF0YS1nby1wbGFjZS1jb2wnLFxyXG4gICAgU0VUVElOR19ST1VORFNfQ09MVU1OUzogJ2RhdGEtZ28tcm91bmRzLWNvbHMnLFxyXG4gICAgU0VUVElOR19DTElDS0lORzogJ2RhdGEtZ28tY2xpY2tpbmcnLFxyXG4gICAgU0VUVElOR19IT1ZFUklORzogJ2RhdGEtZ28taG92ZXJpbmcnLFxyXG4gICAgUExBWUVSX1BMQUNFTUVOVDogJ2RhdGEtZ28tcGxhY2UnLFxyXG4gICAgT1BQT05FTlRfUExBQ0VNRU5UOiAnZGF0YS1nby1vcHBvbmVudCcsXHJcbiAgICBPUFBPTkVOVFM6ICdkYXRhLWdvLW9wcG9uZW50cycsXHJcbiAgICBHQU1FX1JFU1VMVDogJ2RhdGEtZ28tcmVzdWx0J1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgbWFwIG9mIHBvc3NpYmxlIHJlc3VsdHMgaW50byBhcnJheSBvZiBvYmplY3RzIHdpdGggcmVnZXhwIHN0cmluZ1xyXG4gKiBjb252ZXJ0ZWQgaW50byBSZWdFeHAgb2JqZWN0cy5cclxuICogQHBhcmFtIHtvYmplY3R9IHJlc3VsdHNcclxuICogQHJldHVybnMge0FycmF5Ljx7Y2xzOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwfT59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9SZXN1bHRzV2l0aFJlZ0V4cChyZXN1bHRzKSB7XHJcbiAgICBjb25zdCBtYXAgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBjbHMgaW4gcmVzdWx0cykge1xyXG4gICAgICAgIGlmIChyZXN1bHRzLmhhc093blByb3BlcnR5KGNscykpIHtcclxuICAgICAgICAgICAgbWFwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY2xzLFxyXG4gICAgICAgICAgICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKHJlc3VsdHNbY2xzXSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgdGhlIGVsZW1lbnQgZm9yIDMgYXR0cmlidXRlcyBhbmQgcmV0dXJucyBvYmplY3Qgd2l0aCBzZXQgYXBwcm9wcmlhdGVcclxuICogdmFsdWVzXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZFRhYmxlU2V0dGluZ3NGcm9tRE9NKHRhYmxlKSB7XHJcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUExBQ0VfQ09MVU1OKSkge1xyXG4gICAgICAgIG91dHB1dC5wbGFjZUNvbHVtbiA9IE51bWJlcih0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19QTEFDRV9DT0xVTU4pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfU1RBUlRJTkdfUk9XKSkge1xyXG4gICAgICAgIG91dHB1dC5zdGFydGluZ1JvdyA9IE51bWJlcih0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19TVEFSVElOR19ST1cpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUk9VTkRTX0NPTFVNTlMpKSB7XHJcbiAgICAgICAgb3V0cHV0LnJvdW5kc0NvbHVtbnMgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19ST1VORFNfQ09MVU1OUyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0NMSUNLSU5HKSkge1xyXG4gICAgICAgIG91dHB1dC5jbGlja2luZyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0NMSUNLSU5HKSAhPT0gJ2ZhbHNlJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGFibGUuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfSE9WRVJJTkcpKSB7XHJcbiAgICAgICAgb3V0cHV0LmhvdmVyaW5nID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfSE9WRVJJTkcpICE9PSAnZmFsc2UnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBhcnJheS1saWtlIG9iamVjdHMgKHN1Y2ggYXMgYXJndW1lbnRzIG9yIG5vZGUgbGlzdHMpIGludG8gYW4gYXJyYXlcclxuICogQHBhcmFtIHsqfSBhcnJheUxpa2VcclxuICogQHJldHVybnMge0FycmF5LjxUPn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhc0FycmF5KGFycmF5TGlrZSkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycmF5TGlrZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG5ldyBvYmplY3QgY29udGFpbmluZyBrZXlzIG9ubHkgZnJvbSBkZWZhdWx0T2JqIGJ1dCB2YWx1ZXMgYXJlIHRha2VuXHJcbiAqIGZyb20gaWYgZXhpc3QgKHN0YXJ0aW5nIGZyb20gdGhlIGxhc3Qgb2JqZWN0IHByb3ZpZGVkKVxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGVmYXVsdE9ialxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBvYmplY3RzXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoZGVmYXVsdE9iaiwgLi4ub2JqZWN0cykge1xyXG4gICAgY29uc3Qgb3ZlcnJpZGVzID0gb2JqZWN0c1xyXG4gICAgICAgIC5maWx0ZXIoKG9iaikgPT4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpXHJcbiAgICAgICAgLnJldmVyc2UoKTtcclxuXHJcbiAgICBjb25zdCBjb3VudCA9IG92ZXJyaWRlcy5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBtYWluTG9vcDogZm9yIChsZXQga2V5IGluIGRlZmF1bHRPYmopIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKG92ZXJyaWRlc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG92ZXJyaWRlc1tpXVtrZXldO1xyXG4gICAgICAgICAgICAgICAgY29udGludWUgbWFpbkxvb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3VsdFtrZXldID0gZGVmYXVsdE9ialtrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIG5ldyBvYmplY3QgdGhhdCBoYXMgbWVyZ2VkIHByb3BlcnRpZXMgZnJvbSBhbGwgcHJvdmlkZWQgb2JqZWN0cy5cclxuICogTGF0ZXN0IGFyZ3VtZW50cyBvdmVycmlkZXMgdGhlIGVhcmxpZXIgdmFsdWVzLlxyXG4gKiBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fSBvYmplY3RzXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZSguLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBvYmplY3RzLmZvckVhY2goKG9iamVjdCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufSJdfQ==
(1)
});
