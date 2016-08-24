(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GoResultsHighlighter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _wrapper = require('./lib/wrapper');

var _wrapper2 = _interopRequireDefault(_wrapper);

var _settings = require('./lib/settings');

var _utils = require('./lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initialize() {
    var elementsWithResults = document.querySelectorAll('[' + _settings.DOM_ATTRIBUTES.RESULT_TABLE + ']');

    if (typeof jQuery !== 'undefined') {

        jQuery.fn.goResultsHighlighter = function (options) {
            this.each(function (index, element) {
                var highlighter = new _wrapper2.default(element, options);

                $(highlighter.element).data('GoResultsHighlighter', highlighter);
            });
            return this;
        };

        jQuery(elementsWithResults).goResultsHighlighter();
    } else {
        (0, _utils.asArray)(elementsWithResults).forEach(function (tableEl) {
            return new _wrapper2.default(tableEl);
        });
    }
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

module.exports = _wrapper2.default;

},{"./lib/settings":5,"./lib/utils":6,"./lib/wrapper":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _settings = require('./settings');

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _raw2table = require('./raw2table');

var _raw2table2 = _interopRequireDefault(_raw2table);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GoResultsHighlighter = function () {

    /**
     * Creates new instance of GoResultsHighlighter
     *
     * @param {HTMLElement|Node} element - main element containing table with results
     * @param {HighlighterSettings} [settings] - plugin settings
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

        this.current = null;
        this.games = [];
        this.isRearranged = false;
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
         * @param {object|null} [settings] - highlighting settings or player to be highlighted
         * @param {number} [settings.player] - player whose opponents should be
         * highlighted
         * @param {boolean} [settings.rearrange=false] - whether the table should be
         * rearranged to display results in compact size
         * @param {Array.<number>} [settings.games] - the opponent whose game with the
         * player should be highlighted
         */

    }, {
        key: 'highlight',
        value: function highlight(settings) {
            var _this = this;

            if (!settings) {
                settings = {};
            }

            var playerPlace = settings.player;
            var rearrange = settings.rearrange === true;
            var gamesToHighlight = settings.games;

            var player = this.map[playerPlace];
            var classes = (0, _settings.toPrefixedClasses)(this.settings);

            // if table is already rearranged then transform it back to default state
            if (this.isRearranged) {
                restoreNaturalOrder(this.players);
            }

            // rearrange the table if player and appropriate setting is provided
            if (player && rearrange) {
                rearrangeOrder(player, player.opponents.map(function (opponentPlace) {
                    return _this.map[opponentPlace];
                }));

                this.element.classList.add(classes.rearrangedCls);
                this.isRearranged = true;
            } else {
                this.element.classList.remove(classes.rearrangedCls);
                this.isRearranged = false;
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

            // clear list of highlighted games
            this.games.length = 0;

            if (player) {
                if (typeof gamesToHighlight === 'number') {
                    gamesToHighlight = [gamesToHighlight];
                }

                if (gamesToHighlight && typeof gamesToHighlight.length === 'number') {
                    gamesToHighlight.forEach(function (opponentPlace) {
                        var opponent = _this.map[opponentPlace];
                        var game = player.games[opponentPlace];

                        if (opponent && game) {
                            game.cell.classList.add(classes.gameCls);
                            opponent.games[playerPlace].cell.classList.add(classes.gameCls);
                            _this.games.push(opponentPlace);
                        }
                    });
                } else if (this.isRearranged) {
                    player.opponents.forEach(function (opponent) {
                        _this.map[opponent].games[playerPlace].cell.classList.add(classes.gameCls);
                        _this.games.push(opponent);
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
         * Change settings
         * @param {HighlighterSettings} settings
         */

    }, {
        key: 'configure',
        value: function configure(settings) {

            // remove any highlighting
            this.highlight(null);

            // remove class name added to the table
            this.element.classList.remove(this.settings.prefixCls + this.settings.tableCls);

            // update settings
            this.settings = (0, _utils.defaults)(this.settings, settings);

            // create new player map (parse rows)
            this.createPlayersMap();

            // add new class name to the table
            this.element.classList.add(this.settings.prefixCls + this.settings.tableCls);
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
                if (hasTouchMoved || _this2.settings.rearranging === false && _this2.settings.hovering === false) {
                    return;
                }

                var _fetchInformationAbou = fetchInformationAboutTarget(event.target);

                var target = _fetchInformationAbou.target;
                var player = _fetchInformationAbou.player;
                var games = _fetchInformationAbou.games;


                if (!player) {
                    return;
                }

                var rearrange = false;
                var lastTargetPos = void 0;

                if (_this2.current === player) {
                    if (!_this2.settings.rearranging || !_this2.settings.hovering) {
                        player = null;
                    }
                    rearrange = !_this2.isRearranged;
                } else if (_this2.isRearranged || !_this2.settings.hovering) {
                    rearrange = true;
                }

                if (rearrange) {
                    lastTargetPos = target.getBoundingClientRect().top;
                }

                _this2.highlight({ player: player, games: games, rearrange: rearrange });

                if (lastTargetPos) {
                    updateTopPosition(target, lastTargetPos);
                }

                event.preventDefault();
            });

            this.element.addEventListener('click', function (event) {
                if (_this2.settings.rearranging === false) {
                    return;
                }

                var _fetchInformationAbou2 = fetchInformationAboutTarget(event.target);

                var target = _fetchInformationAbou2.target;
                var player = _fetchInformationAbou2.player;
                var games = _fetchInformationAbou2.games;

                var rearrange = false;
                var lastTargetPos = void 0;

                if (!player) {
                    return;
                }

                if (!_this2.isRearranged || target.properNextSibling) {
                    rearrange = true;
                } else if (!_this2.settings.hovering) {
                    player = null;
                }

                if (rearrange) {
                    lastTargetPos = target.getBoundingClientRect().top;
                }

                _this2.highlight({ player: player, games: games, rearrange: rearrange });

                if (lastTargetPos) {
                    updateTopPosition(target, lastTargetPos);
                }
            });

            this.element.addEventListener('mouseover', function (event) {
                if (_this2.settings.hovering === false) {
                    return;
                }

                var _fetchInformationAbou3 = fetchInformationAboutTarget(event.target);

                var player = _fetchInformationAbou3.player;
                var games = _fetchInformationAbou3.games;

                var rearrange = _this2.isRearranged;

                if (!player) {
                    return;
                }

                if (_this2.isRearranged) {
                    if ((!games || player !== _this2.current) && _this2.games.length === _this2.map[_this2.current].opponents.length) {
                        return;
                    }

                    if (player !== _this2.current) {
                        player = _this2.current;
                        games = null;
                    }
                }

                _this2.highlight({ player: player, rearrange: rearrange, games: games });
            }, false);

            this.element.addEventListener('mouseout', function (event) {
                if (_this2.settings.hovering === false) {
                    return;
                }

                var target = event.relatedTarget;

                while (target && target !== document && target !== _this2.element) {
                    target = target.parentNode;
                }

                // if new hovered element is outside the table then remove all
                // selections unless the table is rearranged - then only highlight
                // all games
                if (target !== _this2.element) {
                    if (_this2.isRearranged && _this2.games.length !== _this2.map[_this2.current].opponents.length) {
                        _this2.highlight({ player: _this2.current, rearrange: true });
                    } else if (!_this2.isRearranged) {
                        _this2.highlight(null);
                    }
                }
            }, false);
        }

        /**
         * Removes inline styles from player rows and their children.
         */

    }, {
        key: 'clearInlineStyles',
        value: function clearInlineStyles() {
            this.players.forEach(function (player) {
                // player.row.removeAttribute('style');
                (0, _utils.asArray)(player.row.childNodes).forEach(function (child) {
                    return child.removeAttribute('style');
                });
            });
        }
    }]);

    return GoResultsHighlighter;
}();

/**
 * Compare current target's top position with previous value and scroll window
 * to previous value if it differs
 * @param {HTMLElement|Node} target
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
 * @param {HTMLElement|Node} target - target of the event
 * @returns {object}
 */
function fetchInformationAboutTarget(target) {
    var result = {
        player: null,
        games: null,
        target: null
    };

    // fetch information about hovered element
    while (target && target !== document) {
        var opponentGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT);
        var playerGridPlacement = target.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT);

        // game cell?
        if (opponentGridPlacement) {
            result.games = Number(opponentGridPlacement);
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

},{"./parser":3,"./raw2table":4,"./settings":5,"./utils":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parse;

var _utils = require('./utils');

var _settings = require('./settings');

function writeGridPlacement(row, placement) {
    row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
}

/**
 * Returns array of columns (array of cell values in the column) from given list of rows.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {string} cellSelector
 * @returns {Array.<Array.<string>>}
 */
function getColumnsFromRows(rows, cellSelector) {
    return rows.reduce(function (columns, row) {
        (0, _utils.asArray)(row.querySelectorAll(cellSelector)).forEach(function (cell, index) {
            var column = columns[index];

            if (!column) {
                column = [];
                columns[index] = column;
            }

            column.push(cell.textContent);
        });

        return columns;
    }, []);
}

/**
 * From given set of strings it returns the ones that look like Go results.
 *
 * @param {Array.<string>} items
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {Array.<string>}
 */
function getItemsWithGoResults(items, resultsMap) {
    return items.filter(function (cell) {
        return resultsMap.some(function (result) {
            return cell.match(result.regexp);
        });
    });
}

/**
 * Checks if at least 40% of strings from given set look like Go results.
 * Why 40%? This value allowed to eliminate some sneaky columns from OpenGotha results where "=" is
 * used to show halves and is interpreted as jigo result by Highlighter. If the value is too high
 * then it is likely that large tournament results (like congress) will be not parsed correctly
 * as many people drop/skip rounds.
 *
 * @param {Array.<string>} items
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {boolean}
 */
function checkItemsForResults(items, resultsMap) {
    var count = items.length;
    var itemsWithResultsCount = getItemsWithGoResults(items, resultsMap).length;

    return itemsWithResultsCount / count >= 0.4;
}

/**
 * Returns the array of indexes of columns that look like keeping Go results.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {string} cellSelector
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithResultsFromRows(rows, cellSelector, resultsMap) {
    return getColumnsFromRows(rows, cellSelector).reduce(function (indexes, column, index) {
        if (checkItemsForResults(column, resultsMap)) {
            indexes.push(index);
        }

        return indexes;
    }, []);
}

/**
 * Creates filter function which returns items from provided list of indexes.
 *
 * @param {Array.<number>} columnsIndexes
 * @returns {function(*, *=): boolean}
 */
function createCellFromColumnsFilter(columnsIndexes) {
    return function (cell, index) {
        return columnsIndexes.indexOf(index) !== -1;
    };
}

/**
 * Returns the array of indexes of columns with Go results based on settings.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {function(*, *=): boolean}
 */
function getFilterForColumnsWithResults(rows, settings, resultsMap) {
    if (typeof settings.roundsColumns === 'string') {
        var _indexes = settings.roundsColumns.split(',').map(Number);

        return createCellFromColumnsFilter(_indexes);
    }

    // check is disabled - return all columns
    if (!settings.checkColumnsForResults) {
        return function () {
            return true;
        };
    }

    var indexes = getIndexesOfColumnsWithResultsFromRows(rows, settings.cellTags, resultsMap);

    return createCellFromColumnsFilter(indexes);
}

/**
 * Returns the array of indexes of columns that look like keeping player names
 * by searching for certain header names.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithNamesByHeaderNames(rows, settings) {
    var regexps = (0, _settings.nameHeadersToRegExp)(settings.nameColumnHeaders);

    var indexes = [];
    var columns = getColumnsFromRows(rows, settings.headerTags);
    columns.forEach(function (cells, index) {
        if (cells.some(function (cell) {
            return regexps.some(function (rx) {
                return cell.match(rx);
            });
        })) {
            indexes.push(index);
        }
    });

    return indexes;
}

/**
 * Checks if at least threshold level of strings from given set look like player names.
 *
 * @param {Array.<string>} items
 * @param {function(string): boolean} filter
 * @param {number} threshold
 * @returns {boolean}
 */
function checkItems(items, filter, threshold) {
    threshold = threshold || 0.4;
    var count = items.length;
    var itemsWithResultsCount = items.filter(function (cell) {
        return filter(cell);
    }).length;

    return itemsWithResultsCount / count >= threshold;
}

/**
 * Returns the array of indexes of columns that look like keeping player names
 * by inspecting cell values
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithNamesByCellValues(rows, settings) {
    if (!settings.nameCellExpression) {
        return [];
    }

    var regExp = new RegExp(settings.nameCellExpression);

    var nameFilter = function nameFilter(cell) {
        return cell.match(regExp);
    };
    return getColumnsFromRows(rows, settings.cellTags).reduce(function (indexes, column, index) {
        if (checkItems(column, nameFilter)) {
            indexes.push(index);
        }

        return indexes;
    }, []);
}

/**
 * Returns a filter that allows to select columns containing player name.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {function(*, *=): boolean}
 */
function getFilterForColumnsWithName(rows, settings) {
    var indexes = [];
    if (typeof settings.nameColumns === 'string') {
        indexes = settings.nameColumns.split(',').map(Number);
    } else if ((0, _utils.isNumber)(settings.nameColumns)) {
        indexes.push(parseInt(settings.nameColumns));
    } else if (settings.checkColumnsForPlayerNames) {
        indexes = getIndexesOfColumnsWithNamesByHeaderNames(rows, settings);
        if (!indexes || indexes.length == 0) {
            indexes = getIndexesOfColumnsWithNamesByCellValues(rows, settings);
        }
    }

    return createCellFromColumnsFilter(indexes);
}

/**
 * Traverses provided table and creates results map.
 *
 * @param {Element|HTMLElement} table - table results container
 * @param {HighlighterSettings} [config] - settings for parser
 * @returns {object}
 */
function parse(table, config) {
    var settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, config);
    var rows = (0, _utils.asArray)(table.querySelectorAll(settings.rowTags));
    var resultsMap = (0, _settings.toResultsWithRegExp)(settings.results);
    var resultsMapCount = resultsMap.length;
    var columnsWithResultsFilter = getFilterForColumnsWithResults(rows, settings, resultsMap);
    var columnsForNameFilter = settings.displayOpponentNameHint ? getFilterForColumnsWithName(rows, settings) : function (cell, index) {
        return false;
    };
    var results = [];

    function parseGames(player, cells, players, displayOpponentNameHint) {
        cells.forEach(function (cell) {
            var opponentPlace = void 0;
            var resultCls = void 0;

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

                    // opponent row doesn't exist
                    if (opponentPlace <= 0 || !settings.ignoreOutOfBoundsRows && opponentPlace > rows.length) {
                        return;
                    }

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

            if (displayOpponentNameHint) {
                var opponentName = players[opponentPlace] ? players[opponentPlace].name : '';
                if (opponentName) {
                    cell.setAttribute('title', opponentName);
                }
            }
        });
    }

    var lastTournamentPlacement = void 0;
    var lastGridPlacement = void 0;

    rows.forEach(function (row, index) {
        if (index < settings.startingRow) {
            return;
        }

        var cells = (0, _utils.asArray)(row.querySelectorAll(settings.cellTags));
        var cellsWithName = cells.filter(columnsForNameFilter);
        var name = cellsWithName.map(function (cell) {
            return cell.textContent;
        }).join(' ');

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
            opponents: [],
            name: name
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

        player.tournamentPlace = tournamentPlacement;
        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    results.forEach(function (player) {
        var cells = (0, _utils.asArray)(player.row.querySelectorAll(settings.cellTags));
        var cellsWithResults = cells.filter(columnsWithResultsFilter);

        parseGames(player, cellsWithResults, results, settings.displayOpponentNameHint);

        player.opponents.sort(function (a, b) {
            return a > b ? 1 : -1;
        });
    });

    return (0, _utils.arrayToObject)(results);
}

},{"./settings":5,"./utils":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = convertRawResultsToTable;

var _settings = require('./settings');

var _utils = require('./utils');

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
    var lines = rawResults.replace(/<br[^>]*>/gi, '\n').replace(/<\/?code[^>]*>/gi, '').split(/\r\n|\n/);

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

    var previousPlace = void 0;

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

},{"./settings":5,"./utils":6}],5:[function(require,module,exports){
'use strict';

/**
 * Default settings of the plugin
 * @type {HighlighterSettings}
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toResultsWithRegExp = toResultsWithRegExp;
exports.nameHeadersToRegExp = nameHeadersToRegExp;
exports.toPrefixedClasses = toPrefixedClasses;
exports.readTableSettingsFromDOM = readTableSettingsFromDOM;
var DEFAULT_SETTINGS = exports.DEFAULT_SETTINGS = {

    // css class names
    prefixCls: 'go-results-',
    rearrangedCls: 'rearranged',
    tableCls: 'table',
    gameCls: 'game',
    currentCls: 'current',

    // results map
    results: {
        won: '([0-9]+)\\+',
        lost: '([0-9]+)\\-',
        jigo: '([0-9]+)=',
        unresolved: '([0-9]+)\\?'
    },

    // parser settings
    startingRow: 0,
    placeColumn: 0,
    roundsColumns: null,
    nameColumns: null,
    nameColumnHeaders: ['name', 'player', 'gracz', 'imię'],
    nameCellExpression: '(?=^.*[A-Z][a-z]{3,})(?!.*([Kk][yy][uu]|[Dd][Aa][Nn]))',
    rowTags: 'tr',
    cellTags: 'td',
    headerTags: 'th',
    ignoreOutOfBoundsRows: false,
    checkColumnsForResults: true,
    displayOpponentNameHint: true,
    checkColumnsForPlayerNames: true,

    // converter settings
    cellSeparator: '[\t ]+',
    joinNames: true,

    // behavior settings
    hovering: true,
    rearranging: true
};

var CLASSES_TO_BE_PREFIXED = ['rearrangedCls', 'tableCls', 'gameCls', 'currentCls'];

/**
 * Names of attributes used in this plugin
 * @type {{RESULT_TABLE: string, SETTING_STARTING_ROW: string, SETTING_PLACE_COLUMN: string, SETTING_ROUNDS_COLUMNS: string, SETTING_REARRANGING: string, SETTING_HOVERING: string, PLAYER_PLACEMENT: string, OPPONENT_PLACEMENT: string, OPPONENTS: string, GAME_RESULT: string}}
 */
var DOM_ATTRIBUTES = exports.DOM_ATTRIBUTES = {
    RESULT_TABLE: 'data-go-results',
    SETTING_STARTING_ROW: 'data-go-starting-row',
    SETTING_PLACE_COLUMN: 'data-go-place-column',
    SETTING_ROUNDS_COLUMNS: 'data-go-rounds-columns',
    SETTING_REARRANGING: 'data-go-rearranging',
    SETTING_HOVERING: 'data-go-hovering',
    PLAYER_PLACEMENT: 'data-go-place',
    OPPONENT_PLACEMENT: 'data-go-opponent',
    OPPONENT_NAME: 'data-go-name',
    OPPONENTS: 'data-go-opponents',
    GAME_RESULT: 'data-go-result'
};

/**
 * Transforms map of possible results into array of objects with regexp string
 * converted into RegExp objects.
 * @param {ClassToResultMapping} results
 * @returns {Array.<ResultMapping>}
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
 * Transforms array of possible column with player name headers to RegExp
 * @param {Array.<string>} columnHeaders
 * @returns {Array.<RegExp>}
 */
function nameHeadersToRegExp(columnHeaders) {
    if (!columnHeaders || columnHeaders.length == 0) {
        return [];
    }

    return columnHeaders.map(function (header) {
        return new RegExp(header, 'i');
    });
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
 * Checks the element for attributes and returns object with set appropriate
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

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_REARRANGING)) {
        output.rearranging = table.getAttribute(DOM_ATTRIBUTES.SETTING_REARRANGING) !== 'false';
    }

    if (table.hasAttribute(DOM_ATTRIBUTES.SETTING_HOVERING)) {
        output.hovering = table.getAttribute(DOM_ATTRIBUTES.SETTING_HOVERING) !== 'false';
    }

    return output;
}

/**
 * @typedef {object} ClassToResultMapping
 * @property {string} [won='([0-9]+)\\+'] - default winning regexp
 * @property {string} [lost='([0-9]+)\\-'] - default losing regexp
 * @property {string} [jigo='([0-9]+)='] - default draw regexp
 * @property {string} [unresolved='([0-9]+)\\?] - default unresolved regexp
 */

/**
 * @typedef {object} ResultMapping
 * @property {string} cls - CSS class name to be added to row which matches the regexp
 * @property {RegExp} regexp - Regexp for result determination
 */

/**
 * @typedef {object} HighlighterSettings
 * @property {string} [prefixCls='go-results-'] - css class prefix
 * @property {string} [rearrangedCls='rearranged'] - class applied when table is rearranged
 * @property {string} [gameCls='game'] - class applied when to game results
 * @property {string} [currentCls='current'] - selected row class name
 * @property {ClassToResultMapping} [results] - contains regexps used to determine game results mapped to css class that is applied to the cell with given result
 * @property {number} [placeColumn=0] - index of the column where the script should expect to find player's placement
 * @property {number} [startingRow=0] - row in table from which the search of results should start
 * @property {string|null} [roundsColumns=null] - coma-separated list of columns which should contain the results, otherwise all columns are scanned
 * @property {string} [rowTags='tr'] - querySelection-compatible string with tags representing players' rows
 * @property {string} [cellTags='td,th'] - querySelection-compatible
 * @property {boolean} [checkColumnsForResults=true] - whether the highlighter should first try to find columns with Go results before parsing every row
 * @property {boolean} [ignoreOutOfBoundsRows=false] - whether it is allowed to have games with player that are not visible on the list (e.g. when table is paginated)
 * @property {string} [cellSeparator='[\t ]+'] - regexp used to split single line into columns when parsing unformatted results
 * @property {boolean} [joinNames=true] - whether 2 columns next to placement should be treated as name and surname and merged into single column when parsing unformatted results
 * @property {boolean} [hovering=true] - whether hovering should be enabled
 * @property {boolean} [rearranging=true] - whether row rearrangement on click should be enabled
 */

},{}],6:[function(require,module,exports){
'use strict';

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.asArray = asArray;
exports.defaults = defaults;
exports.combine = combine;
exports.isNumber = isNumber;
exports.arrayToObject = arrayToObject;
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

/**
 * Check whether given object is a number.
 * 
 * @param {object} numberToTest 
 * @returns {boolean}
 */
function isNumber(numberToTest) {
    return !isNaN(parseFloat(numberToTest)) && isFinite(numberToTest);
}

/**
 * Converts array to object
 * @param {Array.<object>} array
 * @returns {object}
 */
function arrayToObject(array) {
    var result = {};
    for (var i = 0; i < array.length; i++) {
        if (array[i] !== undefined) {
            result[i] = array[i];
        }
    }
    return result;
}

},{}],7:[function(require,module,exports){
'use strict';

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

    /**
     * Removes inline styles from player rows and their children.
     */
    this.clearInlineStyles = function () {
        highlighter.clearInlineStyles();
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
                ignoreOutOfBoundsRows: highlighter.settings.ignoreOutOfBoundsRows,
                checkColumnsForResults: highlighter.settings.checkColumnsForResults,
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

module.exports = GoResultsHighlighter;

},{"./highlighter":2}]},{},[1])(1)
});
//# sourceMappingURL=go-results-highlighter.js.map
