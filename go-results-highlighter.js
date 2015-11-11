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
    var resultElements = (0, _utils.asArray)(document.querySelectorAll('[' + _settings.DOM_ATTRIBUTES.RESULT_TABLE + ']'));

    resultElements.forEach(function (tableEl) {
        tableEl.goResultsHighlighter = new _plugin2['default'](tableEl);
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
            $(element).data('GoResultsHighlighter', new _plugin2['default'](element, options));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvZmFrZV9kMDZmYzFkYS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BhcnNlci5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BsdWdpbi5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3JhdzJ0YWJsZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3NldHRpbmdzLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7O3NCQUVvQixVQUFVOzs7O3dCQUNaLFlBQVk7O3FCQUNuQixTQUFTOztBQUVqQyxTQUFTLFVBQVUsR0FBRztBQUNsQixRQUFNLGNBQWMsR0FBRyxvQkFBUSxRQUFRLENBQUMsZ0JBQWdCLE9BQUsseUJBQWUsWUFBWSxPQUFJLENBQUMsQ0FBQzs7QUFFOUYsa0JBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDaEMsZUFBTyxDQUFDLG9CQUFvQixHQUFHLHdCQUF5QixPQUFPLENBQUMsQ0FBQztLQUNwRSxDQUFDLENBQUM7Q0FDTjs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFF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KHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IEdvUmVzdWx0c0hpZ2hsaWdodGVyIGZyb20gJy4vcGx1Z2luJztcclxuaW1wb3J0IHsgRE9NX0FUVFJJQlVURVMgfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHsgYXNBcnJheSB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgIGNvbnN0IHJlc3VsdEVsZW1lbnRzID0gYXNBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbJHtET01fQVRUUklCVVRFUy5SRVNVTFRfVEFCTEV9XWApKTtcclxuXHJcbiAgICByZXN1bHRFbGVtZW50cy5mb3JFYWNoKCh0YWJsZUVsKSA9PiB7XHJcbiAgICAgICAgdGFibGVFbC5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZUVsKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgaW5pdGlhbGl6ZSgpO1xyXG59IGVsc2Uge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXRpYWxpemUsIGZhbHNlKTtcclxufVxyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBqUXVlcnkuZm4uZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5kYXRhKCdHb1Jlc3VsdHNIaWdobGlnaHRlcicsIG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcihlbGVtZW50LCBvcHRpb25zKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBhc0FycmF5LCBkZWZhdWx0cyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBET01fQVRUUklCVVRFUywgdG9SZXN1bHRzV2l0aFJlZ0V4cCB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5cclxuZnVuY3Rpb24gd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgcGxhY2VtZW50KSB7XHJcbiAgICByb3cuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQsIHBsYWNlbWVudCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBwcm92aWRlZCB0YWJsZSBhbmQgY3JlYXRlIHJlc3VsdHMgbWFwXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlIC0gdGFibGUgcmVzdWx0cyBjb250YWluZXJcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddIC0gc2V0dGluZ3MgZm9yIHBhcnNlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5yb3dUYWdzXVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvbmZpZy5jZWxsVGFnc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucmVzdWx0c11cclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWcucGxhY2VDb2x1bW5dXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnLnN0YXJ0aW5nUm93XVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2UodGFibGUsIGNvbmZpZykge1xyXG4gICAgY29uc3Qgc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCBjb25maWcpO1xyXG4gICAgY29uc3Qgcm93cyA9IGFzQXJyYXkodGFibGUucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5yb3dUYWdzKSk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gdG9SZXN1bHRzV2l0aFJlZ0V4cChzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXBDb3VudCA9IHJlc3VsdHNNYXAubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlR2FtZXMocGxheWVyLCBjZWxscykge1xyXG4gICAgICAgIC8vIGlmIGNvbHVtbnMgcm91bmRzIGFyZSBwcm92aWRlZCB0aGVuIHBhcnNlIG9ubHkgdGhlbVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mucm91bmRzQ29sdW1ucyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgY2VsbHMgPSBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgocm91bmQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2VsbHNbTnVtYmVyKHJvdW5kKV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50UGxhY2U7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRDbHM7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGNlbGwuaGFzQXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxUKSAmJiBjZWxsLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQpKSB7XHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudFBsYWNlID0gTnVtYmVyKGNlbGwuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLk9QUE9ORU5UX1BMQUNFTUVOVCkpO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Q2xzID0gY2VsbC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuR0FNRV9SRVNVTFQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsLnRleHRDb250ZW50Lm1hdGNoKHJlc3VsdHNNYXBbaV0ucmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50UGxhY2UgPSBOdW1iZXIobWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENscyA9IHJlc3VsdHNNYXBbaV0uY2xzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQsIG9wcG9uZW50UGxhY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxULCByZXN1bHRzTWFwW2ldLmNscyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgY2xzOiByZXN1bHRDbHNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICBsZXQgbGFzdEdyaWRQbGFjZW1lbnQ7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Muc3RhcnRpbmdSb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2VsbHMgPSBhc0FycmF5KHJvdy5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLmNlbGxUYWdzKSk7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBkZWZhdWx0IHBsYWNlXHJcbiAgICAgICAgbGV0IGdyaWRQbGFjZW1lbnQgPSAtMTtcclxuXHJcbiAgICAgICAgLy8gbm8gY2VsbHM/IHVubGlrZWx5IHRvIGJlIGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmICghY2VsbHMubGVuZ3RoIHx8ICFjZWxsc1tzZXR0aW5ncy5wbGFjZUNvbHVtbl0pIHtcclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MucGxhY2VDb2x1bW5dLnRleHRDb250ZW50LCAxMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlOiAtMSxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocm93Lmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKSkge1xyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gTnVtYmVyKHJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgbm8gcGxheWVyIGhhcyBiZWVuIG1hcHBlZFxyXG4gICAgICAgICAgICBpZiAoIWxhc3RHcmlkUGxhY2VtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4odG91cm5hbWVudFBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZUdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIHRvdXJuYW1lbnQgaWYgZGVmaW5lZCAocG9zc2libHkgc2hvd2luZyBhbiBleHRyYWN0IGZyb20gZ3JlYXRlciB0YWJsZSlcclxuICAgICAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50IHx8IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gbGFzdEdyaWRQbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gc2V0IGEgbG93ZXIgcGxhY2Ugbm9uZXRoZWxlc3NcclxuICAgICAgICAgICAgaWYgKCF0b3VybmFtZW50UGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPyBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA6IDE7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvdXJuYW1lbnRQbGFjZW1lbnQgPD0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd3JpdGVHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ3JpZFBsYWNlbWVudCA9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJzZUdhbWVzKHBsYXllciwgY2VsbHMpO1xyXG5cclxuICAgICAgICBwbGF5ZXIudG91cm5hbWVudFBsYWNlID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLnNvcnQoKGEsIGIpID0+IGEgPiBiID8gMSA6IC0xKTtcclxuXHJcbiAgICAgICAgcmVzdWx0c1tncmlkUGxhY2VtZW50XSA9IHBsYXllcjtcclxuXHJcbiAgICAgICAgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPSB0b3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIGxhc3RHcmlkUGxhY2VtZW50ID0gZ3JpZFBsYWNlbWVudDtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgRE9NX0FUVFJJQlVURVMsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTSB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wYXJzZXInO1xyXG5pbXBvcnQgY29udmVydCBmcm9tICcuL3JhdzJ0YWJsZSc7XHJcbmltcG9ydCB7IGFzQXJyYXksIGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb1Jlc3VsdHNIaWdobGlnaHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBHb1Jlc3VsdHNIaWdobGlnaHRlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBtYWluIGVsZW1lbnQgY29udGFpbmluZyB0YWJsZSB3aXRoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIC0gcGx1Z2luIHNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLmNvbHVtbj0wXSAtIGluZGV4IG9mIHRoZSBjb2x1bW5cclxuICAgICAqIHdoZXJlIHRoZSBzY3JpcHQgc2hvdWxkIGV4cGVjdCB0byBmaW5kIHBsYXllcidzIHBsYWNlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5yb3c9MF0gLSBzdGFydGluZyByb3cgd2l0aCBwbGF5ZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnByZWZpeENscz0nZ28tcmVzdWx0cy0nXSAtIGNzcyBjbGFzcyBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuZ2FtZUNscz0nZ2FtZSddIC0gZ2FtZSBjZWxsIGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY3VycmVudENscz0nY3VycmVudCddIC0gc2VsZWN0ZWQgcm93IGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3MucmVzdWx0c10gLSBtYXAgd2l0aCBwb3NzaWJsZSByZXN1bHRzLCBieSBkZWZhdWx0XHJcbiAgICAgKiBzdXBwb3J0cyA0IG9wdGlvbnMuIFByb3ZpZGUgd2l0aCBcImNsYXNzTmFtZVwiIC0+IFwicmVnZXhwXCIgcGF0dGVybi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy53b249JyhbMC05XSspXFxcXCsnXSAtIGRlZmF1bHQgd2lubmluZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5sb3N0PScoWzAtOV0rKVxcXFwtJ10gLSBkZWZhdWx0IGxvc2luZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5qaWdvPScoWzAtOV0rKT0nXSAtIGRlZmF1bHQgZHJhdyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy51bnJlc29sdmVkPScoWzAtOV0rKVxcXFw/XSAtIGRlZmF1bHQgdW5yZXNvbHZlZCByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFncz0ndHInXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGUgc3RyaW5nXHJcbiAgICAgKiB3aXRoIHRhZ3MgcmVwcmVzZW50aW5nIHBsYXllcnMnIHJvd3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY2VsbFRhZ3M9J3RkLHRoJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlXHJcbiAgICAgKiBzdHJpbmcgd2l0aCB0YWdzIGhvbGRpbmcgZ2FtZSByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGRlZmF1bHRzKERFRkFVTFRfU0VUVElOR1MsIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTShlbGVtZW50KSwgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxQcmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9IGNvbnZlcnQoZWxlbWVudC5pbm5lckhUTUwsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGFibGUsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0YWJsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgIC8vIG5vdCBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVyc01hcCgpO1xyXG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MudGFibGVDbHMpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgcGxheWVycyBtYXBcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUGxheWVyc01hcCgpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IHBhcnNlKHRoaXMuZWxlbWVudCwgdGhpcy5zZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsYWNlbWVudCBpbiB0aGlzLm1hcCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkocGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2godGhpcy5tYXBbcGxhY2VtZW50XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXJrcyB0aGUgcm93IGZvciBzZWxlY3RlZCBwbGF5ZXIgYW5kIGEgY2VsbCB3aXRoIG9wcG9uZW50cyBnYW1lIGlmXHJcbiAgICAgKiBwcm92aWRlZC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcGxheWVyUGxhY2VdIC0gcGxheWVyJ3MgcGxhY2UsIHNlbGVjdGlvbiB3aWxsIGJlIHJlbW92ZVxyXG4gICAgICogaWYgbm90IHBsYXllciBpcyBmb3VuZCBmb3IgZ2l2ZW4gcGxhY2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3Bwb25lbnRQbGFjZV0gLSBwbGF5ZXIncyBvcHBvbmVudCdzIHBsYWNlIC0gdG8gbWFya1xyXG4gICAgICogY2VsbHMgd2l0aCBnYW1lIGJldHdlZW4gcGxheWVyIGFuZCB0aGUgb3Bwb25lbnRcclxuICAgICAqL1xyXG4gICAgc2VsZWN0UGxheWVyKHBsYXllclBsYWNlLCBvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudENscyA9IHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5jdXJyZW50Q2xzO1xyXG4gICAgICAgIGNvbnN0IGdhbWVDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuZ2FtZUNscztcclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0gdGhpcy5tYXBbcGxheWVyUGxhY2VdO1xyXG5cclxuICAgICAgICBjb25zdCBtYXJrZWRHYW1lcyA9IGFzQXJyYXkodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy4nICsgZ2FtZUNscykpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvdyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGN1cnJlbnRDbHMpO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFJvd1BsYWNlbWVudCA9IG1hcmtlZFJvdyA/IG1hcmtlZFJvdy5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCkgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IG1hcmtlZFBsYXllciA9IG1hcmtlZFJvd1BsYWNlbWVudCA/IHRoaXMubWFwW21hcmtlZFJvd1BsYWNlbWVudF0gOiBudWxsO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgYW55IHZpc2libGUgZ2FtZSBtYXJraW5nc1xyXG4gICAgICAgIG1hcmtlZEdhbWVzLmZvckVhY2goKGdhbWVDZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGdhbWVDZWxsLmNsYXNzTGlzdC5yZW1vdmUoZ2FtZUNscyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgbWFya2VkUGxheWVyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBwbGF5ZXIgaWYgbm90IGFscmVhZHkgbWFya2VkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBwbGF5ZXIgIT09IG1hcmtlZFBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgcGxheWVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgYWxsIHRoZSBnYW1lc1xyXG4gICAgICAgIGlmICh0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50XS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgZ2FtZSBiZXR3ZWVuIHRoZSBwbGF5ZXIgYW5kIHRoZSBvcHBvbmVudFxyXG4gICAgICAgIH0gZWxzZSBpZiAocGxheWVyICYmIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hcmsocGxheWVyLCBhY3RpdmUpIHtcclxuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0W21ldGhvZF0oY3VycmVudENscyk7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50UGxhY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3RbbWV0aG9kXSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jbHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN0b3JlcyBwcm9wZXIgb3JkZXIgb2YgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICByZXN0b3JlRnVsbFJlc3VsdHMoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHBsYXllcikgPT4gcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZylcclxuICAgICAgICAgICAgLnJldmVyc2UoKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBsYXllci5yb3csIHBsYXllci5yb3cucHJvcGVyTmV4dFNpYmxpbmcpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3Muc2hvd2luZ0RldGFpbHNDbHMpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIGRldGFpbHMgZm9yIHNlbGVjdGVkIHBsYXllclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtwbGF5ZXJQbGFjZV1cclxuICAgICAqL1xyXG4gICAgc2hvd0RldGFpbHMocGxheWVyUGxhY2UpIHtcclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcblxyXG4gICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHBsYXllci5yb3cucGFyZW50Tm9kZTtcclxuICAgICAgICBsZXQgYWZ0ZXIgPSBwbGF5ZXIucm93Lm5leHRTaWJsaW5nO1xyXG5cclxuICAgICAgICBwbGF5ZXIub3Bwb25lbnRzLmZvckVhY2goKG9wcG9uZW50UGxhY2UpID0+IHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICBvcHBvbmVudC5yb3cucHJvcGVyTmV4dFNpYmxpbmcgPSBvcHBvbmVudC5yb3cubmV4dFNpYmxpbmc7XHJcblxyXG4gICAgICAgICAgICBpZiAob3Bwb25lbnRQbGFjZSA8IHBsYXllclBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgcGxheWVyLnJvdyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgYWZ0ZXIpO1xyXG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBvcHBvbmVudC5yb3cubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICB0aGlzLnNob3dpbmdEZXRhaWxzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyUGxhY2VtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlBMQVlFUl9QTEFDRU1FTlQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBsYWNlbWVudCA9IHBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGxhc3RUYXJnZXRQb3M7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0RldGFpbHMocGxheWVyUGxhY2VtZW50KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LnByb3Blck5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0VGFyZ2V0UG9zID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVGdWxsUmVzdWx0cygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RGV0YWlscyhwbGF5ZXJQbGFjZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxhc3RUYXJnZXRQb3MgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUZ1bGxSZXN1bHRzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGFzdFRhcmdldFBvcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gbGFzdFRhcmdldFBvcztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCBkaWZmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gZmV0Y2ggaW5mb3JtYXRpb24gYWJvdXQgaG92ZXJlZCBlbGVtZW50XHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50R3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuT1BQT05FTlRfUExBQ0VNRU5UKTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXJHcmlkUGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5UKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnYW1lIGNlbGw/XHJcbiAgICAgICAgICAgICAgICBpZiAob3Bwb25lbnRHcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQgPSBvcHBvbmVudEdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcGxheWVyIHJvdz8gbm8gZnVydGhlciBzZWFyY2ggaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyR3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllciA9IHBsYXllckdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllciwgb3Bwb25lbnQpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50ICYmIHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgbmV3IGhvdmVyZWQgZWxlbWVudCBpcyBvdXRzaWRlIHRoZSB0YWJsZSB0aGVuIHJlbW92ZSBhbGxcclxuICAgICAgICAgICAgLy8gc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuR29SZXN1bHRzSGlnaGxpZ2h0ZXIuREVGQVVMVF9TRVRUSU5HUyA9IERFRkFVTFRfU0VUVElOR1M7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERPTV9BVFRSSUJVVEVTLCB0b1Jlc3VsdHNXaXRoUmVnRXhwIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG4vKipcclxuICogQ29udmVydHMgcmF3IHJlc3VsdHMgc3RyaW5nIGludG8gdGFibGUgd2l0aCByb3dzIGFuZCBjZWxscy5cclxuICogUmV0dXJucyBudWxsIGlmIG5vdCB2YWxpZCBpbnB1dC5cclxuICogQHBhcmFtIHtzdHJpbmd9IHJhd1Jlc3VsdHNcclxuICogQHBhcmFtIHtvYmplY3R9IFtjb25maWddXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uZmlnLnN0YXJ0aW5nUm93PTBdIC0gaW5mb3JtcyB3aGVyZSBpcyB0aGUgZmlyc3Qgcm93IHdpdGggcmVzdWx0c1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW2NvbmZpZy5wbGFjZUNvbHVtbj0wXSAtIGluZm9ybXMgaW4gd2hpY2ggY29sdW1uIGlzIHRoZSBwbGFjZSBsb2NhdGVkXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29uZmlnLnJvdW5kc0NvbHVtbnNdIC0gY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY29sdW1ucyB3aGVyZSBnYW1lIHJlc3VsdHMgYXJlIGxvY2F0ZWRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtjb25maWcuY2VsbFNlcGFyYXRvcj0nW1xcdCBdKyddIC0gc2VwYXJhdGVkIHVzZWQgdG8gZGl2aWRlIHJvd3MgaW50byBjZWxsc1xyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maWcuam9pbk5hbWVzPXRydWVdIC0gam9pbnMgdHdvIGNvbnNlY3V0aXZlIGNlbGxzIGFmdGVyIHRoZSBwbGFjZSBjb2x1bW4gaW50byBvbmUgY2VsbFxyXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8bnVsbH1cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnZlcnRSYXdSZXN1bHRzVG9UYWJsZShyYXdSZXN1bHRzLCBjb25maWcpIHtcclxuICAgIGlmICghcmF3UmVzdWx0cykge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgY29uZmlnKTtcclxuICAgIGNvbnN0IGxpbmVzID0gcmF3UmVzdWx0cy5zcGxpdCgvXFxyXFxufFxcbi8pO1xyXG5cclxuICAgIGlmIChsaW5lcy5sZW5ndGggPD0gMiAmJiAhbGluZXNbMF0gJiYgIWxpbmVzWzFdKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IHRvUmVzdWx0c1dpdGhSZWdFeHAoc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwQ291bnQgPSByZXN1bHRzTWFwLmxlbmd0aDtcclxuICAgIGNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcblxyXG4gICAgY29uc3Qgcm93cyA9IGxpbmVzXHJcbiAgICAgICAgLm1hcCgobGluZSkgPT4gbGluZVxyXG5cclxuICAgICAgICAgICAgLy8gcHJvYmFibHkgdW5oZWFsdGh5IHJlcGxhY2luZyBzcGFjZSBpbiByYW5rIGluIG9yZGVyIHRvIG1ha2Ugc3VyZVxyXG4gICAgICAgICAgICAvLyB0aGF0IGl0IHdvbid0IGJlIGJyb2tlbiBpbnRvIHR3byBjZWxsc1xyXG4gICAgICAgICAgICAucmVwbGFjZSgvKFswLTldKylcXHMoZGFufGt5dSkvaSwgJyQxXyQyJylcclxuXHJcbiAgICAgICAgICAgIC8vIHNwbGl0IGxpbmUgdG8gY2VsbHMgKGNvbnNpZGVyIHRhYnMgYW5kIHNwYWNlcyBhcyBzZXBhcmF0b3JzIGJ5IGRlZmF1bHQpXHJcbiAgICAgICAgICAgIC5zcGxpdChuZXcgUmVnRXhwKHNldHRpbmdzLnJvd1NlcGFyYXRvcikpXHJcblxyXG4gICAgICAgICAgICAvLyByZW1vdmUgZW1wdHkgY2VsbHNcclxuICAgICAgICAgICAgLmZpbHRlcigoY2VsbCkgPT4gY2VsbC5sZW5ndGggPiAwKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIG91dCBlbXB0eSByb3dzIG9yIHJvd3Mgc3RhcnRpbmcgd2l0aCAnOycgKEVHRC9GRkcgY29tbWVudClcclxuICAgICAgICAuZmlsdGVyKChjZWxscykgPT4gY2VsbHMubGVuZ3RoID4gMCAmJiBjZWxsc1swXS5pbmRleE9mKCc7JykgIT09IDApO1xyXG5cclxuICAgIGNvbnN0IHRhYmxlV2lkdGggPSByb3dzLnJlZHVjZSgocHJldiwgbGluZSkgPT4gTWF0aC5tYXgocHJldiwgbGluZS5sZW5ndGgpLCAwKTtcclxuICAgIGNvbnN0IHRhYmxlTW9kaWZpZXIgPSBzZXR0aW5ncy5qb2luTmFtZXMgPyAtMSA6IDA7XHJcbiAgICBjb25zdCBqb2luTmFtZVBvcyA9IHNldHRpbmdzLnBsYWNlQ29sdW1uICsgMTtcclxuXHJcbiAgICBsZXQgZ2FtZXNJbkNvbHVtbnMgPSBudWxsO1xyXG5cclxuICAgIC8vIGlmIGNvbHVtbnMgcm91bmRzIGFyZSBwcm92aWRlZCB0aGVuIGNvbnZlcnQgb25seSB0aGVtXHJcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLnJvdW5kc0NvbHVtbnMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZ2FtZXNJbkNvbHVtbnMgPSBzZXR0aW5ncy5yb3VuZHNDb2x1bW5zLnNwbGl0KCcsJykubWFwKE51bWJlcik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHByZXZpb3VzUGxhY2U7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChjZWxscywgaW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gY2VsbHMubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoIXdpZHRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnN0YXJ0aW5nUm93IHx8IHdpZHRoIDwgKHRhYmxlV2lkdGggKyB0YWJsZU1vZGlmaWVyKSkge1xyXG4gICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZSgnY29sc3BhbicsIHRhYmxlV2lkdGggKyB0YWJsZU1vZGlmaWVyKTtcclxuICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxzLmpvaW4oJyAnKTtcclxuXHJcbiAgICAgICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuUExBWUVSX1BMQUNFTUVOVCwgLTEpO1xyXG4gICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQoY2VsbCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwbGFjZSA9IHBhcnNlSW50KGNlbGxzW3NldHRpbmdzLnBsYWNlQ29sdW1uXSwgMTApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHBsYWNlKSAmJiAhcHJldmlvdXNQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgY2VsbHMuZm9yRWFjaCgoY2VsbENvbnRlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBjZWxsQ29udGVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5QTEFZRVJfUExBQ0VNRU5ULCBwcmV2aW91c1BsYWNlIHx8IHBsYWNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmpvaW5OYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzLnNwbGljZShqb2luTmFtZVBvcywgMiwgYCR7Y2VsbHNbam9pbk5hbWVQb3NdfSAgJHtjZWxsc1tqb2luTmFtZVBvcyArIDFdfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGxDb250ZW50LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGNlbGxDb250ZW50LnJlcGxhY2UoL18vLCAnICcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWdhbWVzSW5Db2x1bW5zIHx8IGdhbWVzSW5Db2x1bW5zLmluZGV4T2YoaW5kZXgpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzTWFwQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gY2VsbENvbnRlbnQubWF0Y2gocmVzdWx0c01hcFtpXS5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRQbGFjZW1lbnQgPSBtYXRjaFsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVF9QTEFDRU1FTlQsIG9wcG9uZW50UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLkdBTUVfUkVTVUxULCByZXN1bHRzTWFwW2ldLmNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChjZWxsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvcHBvbmVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnNldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5PUFBPTkVOVFMsIG9wcG9uZW50cy5qb2luKCcsJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcHJldmlvdXNQbGFjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUGxhY2UgPSAyO1xyXG4gICAgICAgICAgICAgICAgfSAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNQbGFjZSArPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3V0cHV0LmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBvdXRwdXQuc2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlJFU1VMVF9UQUJMRSwgJycpO1xyXG5cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgc2V0dGluZ3Mgb2YgdGhlIHBsdWdpblxyXG4gKiBAdHlwZSB7e3ByZWZpeENsczogc3RyaW5nLCBzaG93aW5nRGV0YWlsc0Nsczogc3RyaW5nLCB0YWJsZUNsczogc3RyaW5nLCBnYW1lQ2xzOiBzdHJpbmcsIGN1cnJlbnRDbHM6IHN0cmluZywgcmVzdWx0czoge3dvbjogc3RyaW5nLCBsb3N0OiBzdHJpbmcsIGppZ286IHN0cmluZywgdW5yZXNvbHZlZDogc3RyaW5nfSwgc3RhcnRpbmdSb3c6IG51bWJlciwgcGxhY2VDb2x1bW46IG51bWJlciwgcm91bmRzQ29sdW1uczogbnVsbCwgcm93VGFnczogc3RyaW5nLCBjZWxsVGFnczogc3RyaW5nLCByb3dTZXBhcmF0b3I6IHN0cmluZywgaG92ZXJpbmc6IGJvb2xlYW4sIGNsaWNraW5nOiBib29sZWFufX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xyXG4gICAgcHJlZml4Q2xzOiAnZ28tcmVzdWx0cy0nLFxyXG4gICAgc2hvd2luZ0RldGFpbHNDbHM6J3Nob3dpbmctZGV0YWlscycsXHJcbiAgICB0YWJsZUNsczogJ3RhYmxlJyxcclxuICAgIGdhbWVDbHM6ICdnYW1lJyxcclxuICAgIGN1cnJlbnRDbHM6ICdjdXJyZW50JyxcclxuXHJcbiAgICByZXN1bHRzOiB7XHJcbiAgICAgICAgd29uOiAnKFswLTldKylcXFxcKycsXHJcbiAgICAgICAgbG9zdDogJyhbMC05XSspXFxcXC0nLFxyXG4gICAgICAgIGppZ286ICcoWzAtOV0rKT0nLFxyXG4gICAgICAgIHVucmVzb2x2ZWQ6ICcoWzAtOV0rKVxcXFw/J1xyXG4gICAgfSxcclxuXHJcbiAgICBzdGFydGluZ1JvdzogMCxcclxuICAgIHBsYWNlQ29sdW1uOiAwLFxyXG4gICAgcm91bmRzQ29sdW1uczogbnVsbCxcclxuXHJcbiAgICByb3dUYWdzOiAndHInLFxyXG4gICAgY2VsbFRhZ3M6ICd0ZCx0aCcsXHJcbiAgICByb3dTZXBhcmF0b3I6ICdbXFx0IF0rJyxcclxuICAgIGpvaW5OYW1lczogdHJ1ZSxcclxuXHJcbiAgICBob3ZlcmluZzogdHJ1ZSxcclxuICAgIGNsaWNraW5nOiB0cnVlXHJcbn07XHJcblxyXG4vKipcclxuICogTmFtZXMgb2YgYXR0cmlidXRlcyB1c2VkIGluIHRoaXMgcGx1Z2luXHJcbiAqIEB0eXBlIHt7UkVTVUxUX1RBQkxFOiBzdHJpbmcsIFNFVFRJTkdfU1RBUlRJTkdfUk9XOiBzdHJpbmcsIFNFVFRJTkdfUExBQ0VfQ09MVU1OOiBzdHJpbmcsIFNFVFRJTkdfUk9VTkRTX0NPTFVNTlM6IHN0cmluZywgUExBWUVSX1BMQUNFTUVOVDogc3RyaW5nLCBPUFBPTkVOVF9QTEFDRU1FTlQ6IHN0cmluZywgR0FNRV9SRVNVTFQ6IHN0cmluZ319XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRE9NX0FUVFJJQlVURVMgPSB7XHJcbiAgICBSRVNVTFRfVEFCTEU6ICdkYXRhLWdvLXJlc3VsdHMnLFxyXG4gICAgU0VUVElOR19TVEFSVElOR19ST1c6ICdkYXRhLWdvLXN0YXJ0aW5nLXJvdycsXHJcbiAgICBTRVRUSU5HX1BMQUNFX0NPTFVNTjogJ2RhdGEtZ28tcGxhY2UtY29sJyxcclxuICAgIFNFVFRJTkdfUk9VTkRTX0NPTFVNTlM6ICdkYXRhLWdvLXJvdW5kcy1jb2xzJyxcclxuICAgIFNFVFRJTkdfQ0xJQ0tJTkc6ICdkYXRhLWdvLWNsaWNraW5nJyxcclxuICAgIFNFVFRJTkdfSE9WRVJJTkc6ICdkYXRhLWdvLWhvdmVyaW5nJyxcclxuICAgIFBMQVlFUl9QTEFDRU1FTlQ6ICdkYXRhLWdvLXBsYWNlJyxcclxuICAgIE9QUE9ORU5UX1BMQUNFTUVOVDogJ2RhdGEtZ28tb3Bwb25lbnQnLFxyXG4gICAgT1BQT05FTlRTOiAnZGF0YS1nby1vcHBvbmVudHMnLFxyXG4gICAgR0FNRV9SRVNVTFQ6ICdkYXRhLWdvLXJlc3VsdCdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIG1hcCBvZiBwb3NzaWJsZSByZXN1bHRzIGludG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHJlZ2V4cCBzdHJpbmdcclxuICogY29udmVydGVkIGludG8gUmVnRXhwIG9iamVjdHMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXN1bHRzXHJcbiAqIEByZXR1cm5zIHtBcnJheS48e2Nsczogc3RyaW5nLCByZWdleHA6IFJlZ0V4cH0+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmVzdWx0c1dpdGhSZWdFeHAocmVzdWx0cykge1xyXG4gICAgY29uc3QgbWFwID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgY2xzIGluIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAocmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShjbHMpKSB7XHJcbiAgICAgICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNscyxcclxuICAgICAgICAgICAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChyZXN1bHRzW2Nsc10pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFwO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHRoZSBlbGVtZW50IGZvciAzIGF0dHJpYnV0ZXMgYW5kIHJldHVybnMgb2JqZWN0IHdpdGggc2V0IGFwcHJvcHJpYXRlXHJcbiAqIHZhbHVlc1xyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRUYWJsZVNldHRpbmdzRnJvbURPTSh0YWJsZSkge1xyXG4gICAgY29uc3Qgb3V0cHV0ID0ge307XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1BMQUNFX0NPTFVNTikpIHtcclxuICAgICAgICBvdXRwdXQucGxhY2VDb2x1bW4gPSBOdW1iZXIodGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUExBQ0VfQ09MVU1OKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1NUQVJUSU5HX1JPVykpIHtcclxuICAgICAgICBvdXRwdXQuc3RhcnRpbmdSb3cgPSBOdW1iZXIodGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfU1RBUlRJTkdfUk9XKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX1JPVU5EU19DT0xVTU5TKSkge1xyXG4gICAgICAgIG91dHB1dC5yb3VuZHNDb2x1bW5zID0gdGFibGUuZ2V0QXR0cmlidXRlKERPTV9BVFRSSUJVVEVTLlNFVFRJTkdfUk9VTkRTX0NPTFVNTlMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0YWJsZS5oYXNBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19DTElDS0lORykpIHtcclxuICAgICAgICBvdXRwdXQuY2xpY2tpbmcgPSB0YWJsZS5nZXRBdHRyaWJ1dGUoRE9NX0FUVFJJQlVURVMuU0VUVElOR19DTElDS0lORykgIT09ICdmYWxzZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRhYmxlLmhhc0F0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0hPVkVSSU5HKSkge1xyXG4gICAgICAgIG91dHB1dC5ob3ZlcmluZyA9IHRhYmxlLmdldEF0dHJpYnV0ZShET01fQVRUUklCVVRFUy5TRVRUSU5HX0hPVkVSSU5HKSAhPT0gJ2ZhbHNlJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgYXJyYXktbGlrZSBvYmplY3RzIChzdWNoIGFzIGFyZ3VtZW50cyBvciBub2RlIGxpc3RzKSBpbnRvIGFuIGFycmF5XHJcbiAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48VD59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXNBcnJheShhcnJheUxpa2UpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IGNvbnRhaW5pbmcga2V5cyBvbmx5IGZyb20gZGVmYXVsdE9iaiBidXQgdmFsdWVzIGFyZSB0YWtlblxyXG4gKiBmcm9tIGlmIGV4aXN0IChzdGFydGluZyBmcm9tIHRoZSBsYXN0IG9iamVjdCBwcm92aWRlZClcclxuICogQHBhcmFtIHtvYmplY3R9IGRlZmF1bHRPYmpcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKGRlZmF1bHRPYmosIC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IG92ZXJyaWRlcyA9IG9iamVjdHNcclxuICAgICAgICAuZmlsdGVyKChvYmopID0+IHR5cGVvZiBvYmogPT09ICdvYmplY3QnKVxyXG4gICAgICAgIC5yZXZlcnNlKCk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBvdmVycmlkZXMubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgbWFpbkxvb3A6IGZvciAobGV0IGtleSBpbiBkZWZhdWx0T2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChvdmVycmlkZXNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvdmVycmlkZXNbaV1ba2V5XTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIG1haW5Mb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXN1bHRba2V5XSA9IGRlZmF1bHRPYmpba2V5XTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IHRoYXQgaGFzIG1lcmdlZCBwcm9wZXJ0aWVzIGZyb20gYWxsIHByb3ZpZGVkIG9iamVjdHMuXHJcbiAqIExhdGVzdCBhcmd1bWVudHMgb3ZlcnJpZGVzIHRoZSBlYXJsaWVyIHZhbHVlcy5cclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmUoLi4ub2JqZWN0cykge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgb2JqZWN0cy5mb3JFYWNoKChvYmplY3QpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gb2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn0iXX0=
(1)
});
