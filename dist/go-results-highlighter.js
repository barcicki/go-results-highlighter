!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.GoResultsHighlighter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _plugin = _dereq_('./plugin');

var _plugin2 = _interopRequireDefault(_plugin);

function initialize() {
    var resultElements = (0, _plugin.asArray)(document.querySelectorAll('[go-results],[data-go-results]'));

    resultElements.forEach(function (tableEl) {
        tableEl.goResultsHighlighter = new _plugin2['default'](tableEl);
    });
}

if (document.readyState === 'complete') {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize, false);
}

exports['default'] = _plugin2['default'];
module.exports = exports['default'];

},{"./plugin":2}],2:[function(_dereq_,module,exports){
'use strict';

/**
 * Default settings of the plugin
 * @type {object}
 */
Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.asArray = asArray;
exports.defaults = defaults;
exports.readDomSettings = readDomSettings;
exports.mapRowsToPlayers = mapRowsToPlayers;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DEFAULT_SETTINGS = {
    prefixCls: 'go-results-',
    showingDetailsCls: 'showing-details',
    tableCls: 'table',
    gameCls: 'game',
    currentCls: 'current',
    overlayCls: 'overlay',
    results: {
        won: '([0-9]+)\\+',
        lost: '([0-9]+)\\-',
        jigo: '([0-9]+)=',
        unresolved: '([0-9]+)\\?'
    },
    row: 0,
    column: 0,
    rowTags: 'tr',
    cellTags: 'td,th',
    hovering: true,
    clicking: true
};

exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
var GRID_PLACEMENT_ATTR = 'data-go-place';
var OPPONENT_GRID_PLACEMENT_ATTR = 'data-go-opponent-place';

/**
 * Informs if the website is run on mobile browser.
 * @type {boolean}
 */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Prefix for DOM settings
 * It will be later used as: "data-prefix-attribute" or "prefix-attribute"
 * @type {string}
 */
var ATTRIBUTES_PREFIX = 'go-results-';

/**
 * List of attributes to be searched for in DOM
 * @type {Array.<string>}
 */
var ATTIRBUTES = ['column', 'row'];

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */

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
 * Transforms map of possible results into array of objects with regexp string
 * converted into RegExp objects.
 * @param {object} results
 * @returns {Array.<{cls: string, regexp: RegExp}>}
 */
function mapResultsSettings(results) {
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
 * Reads row and column settings from the DOM element
 * @param {HTMLElement} element - go results placeholder
 * @returns {object} object with column and row settings if provided
 */

function readDomSettings(element) {
    var result = {};

    ATTIRBUTES.forEach(function (attr) {
        var value = element.getAttribute(ATTRIBUTES_PREFIX + attr);

        if (!value) {
            value = element.getAttribute('data-' + ATTRIBUTES_PREFIX + attr);
        }

        if (value) {
            result[attr] = value;
        }
    });

    return result;
}

function setGridPlacement(row, placement) {
    row.setAttribute(GRID_PLACEMENT_ATTR, placement);
}

/**
 * Traverse provided table and create results map
 * @param {HTMLElement} table - table results container
 * @param {object} settings - mandatory settings for parser
 * @param {string} settings.rowTags
 * @param {string} settings.cellTags
 * @param {object} settings.results
 * @param {object} settings.column
 * @param {object} settings.row
 * @returns {object}
 */

function mapRowsToPlayers(table, settings) {
    var rows = asArray(table.querySelectorAll(settings.rowTags));
    var resultsMap = mapResultsSettings(settings.results);
    var resultsMapCount = resultsMap.length;
    var results = {};

    var lastTournamentPlacement = undefined;
    var lastGridPlacement = undefined;

    rows.forEach(function (row, index) {
        if (index < settings.row) {
            return;
        }

        var cells = asArray(row.querySelectorAll(settings.cellTags));

        // assign default place
        var gridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.column]) {
            return setGridPlacement(row, gridPlacement);
        }

        var tournamentPlacement = parseInt(cells[settings.column].textContent, 10);

        // if no player has been mapped
        if (!lastGridPlacement) {

            // most probably not a result row
            if (isNaN(tournamentPlacement)) {
                return setGridPlacement(row, gridPlacement);
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

        var player = {
            place: tournamentPlacement,
            row: row,
            games: {},
            opponents: []
        };

        cells.forEach(function (cell) {
            for (var i = 0; i < resultsMapCount; i++) {
                var match = cell.textContent.match(resultsMap[i].regexp);

                if (!match) {
                    continue;
                }

                var opponentGridPlacement = Number(match[1]);

                cell.setAttribute(OPPONENT_GRID_PLACEMENT_ATTR, opponentGridPlacement);

                player.games[opponentGridPlacement] = {
                    cell: cell,
                    cls: resultsMap[i].cls
                };
                player.opponents.push(opponentGridPlacement);
            }
        });

        player.opponents.sort(function (a, b) {
            return a > b ? 1 : -1;
        });

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;

        return setGridPlacement(row, gridPlacement);
    });

    return results;
}

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

        this.element = element;

        if (!this.element.classList) {
            // not supported
            return;
        }

        this.settings = defaults(DEFAULT_SETTINGS, readDomSettings(element), settings);

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
            this.map = mapRowsToPlayers(this.element, this.settings);
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

            var markedGames = asArray(this.element.querySelectorAll('.' + gameCls));
            var markedRow = this.element.querySelector('.' + currentCls);
            var markedRowPlacement = markedRow ? markedRow.getAttribute(GRID_PLACEMENT_ATTR) : null;
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

            // unfortunately applying classes on long tables is very expensive
            // operation causing lags. In order to provide better performance
            // feeling a class is not added when the table exceeds 100 rows.
            if (!isMobile || this.players.length < 100) {
                this.element.classList.add(this.settings.prefixCls + this.settings.showingDetailsCls);
            }

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

                if (_this4.showingDetails) {
                    _this4.restoreFullResults();
                    return;
                }

                var target = event.target;
                var playerPlacement = null;

                // fetch information about hovered element
                while (target && target !== document) {
                    var placement = target.getAttribute(GRID_PLACEMENT_ATTR);

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

                _this4.showDetails(playerPlacement);
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
                    var opponentGridPlacement = target.getAttribute(OPPONENT_GRID_PLACEMENT_ATTR);
                    var playerGridPlacement = target.getAttribute(GRID_PLACEMENT_ATTR);

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

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL2Zha2VfNmYwYWJhYmIuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NyYy9wbHVnaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7O3NCQUVpQyxVQUFVOzs7O0FBRXhELFNBQVMsVUFBVSxHQUFHO0FBQ2xCLFFBQU0sY0FBYyxHQUFHLHFCQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7O0FBRTVGLGtCQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ2hDLGVBQU8sQ0FBQyxvQkFBb0IsR0FBRyx3QkFBeUIsT0FBTyxDQUFDLENBQUM7S0FDcEUsQ0FBQyxDQUFDO0NBQ047O0FBRUQsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVUsRUFBRTtBQUNwQyxjQUFVLEVBQUUsQ0FBQztDQUNoQixNQUFNO0FBQ0gsWUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNwRTs7Ozs7O0FDaEJELFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1OLElBQU0sZ0JBQWdCLEdBQUc7QUFDNUIsYUFBUyxFQUFFLGFBQWE7QUFDeEIscUJBQWlCLEVBQUMsaUJBQWlCO0FBQ25DLFlBQVEsRUFBRSxPQUFPO0FBQ2pCLFdBQU8sRUFBRSxNQUFNO0FBQ2YsY0FBVSxFQUFFLFNBQVM7QUFDckIsY0FBVSxFQUFFLFNBQVM7QUFDckIsV0FBTyxFQUFFO0FBQ0wsV0FBRyxFQUFFLGFBQWE7QUFDbEIsWUFBSSxFQUFF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O2FBQ0osRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNiOzs7V0FqUWdCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0I7O0FBb1F6QyxvQkFBb0IsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgR29SZXN1bHRzSGlnaGxpZ2h0ZXIsIHsgYXNBcnJheSB9IGZyb20gJy4vcGx1Z2luJztcclxuXHJcbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XHJcbiAgICBjb25zdCByZXN1bHRFbGVtZW50cyA9IGFzQXJyYXkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2dvLXJlc3VsdHNdLFtkYXRhLWdvLXJlc3VsdHNdJykpO1xyXG5cclxuICAgIHJlc3VsdEVsZW1lbnRzLmZvckVhY2goKHRhYmxlRWwpID0+IHtcclxuICAgICAgICB0YWJsZUVsLmdvUmVzdWx0c0hpZ2hsaWdodGVyID0gbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKHRhYmxlRWwpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbn0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZSwgZmFsc2UpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICAgIHByZWZpeENsczogJ2dvLXJlc3VsdHMtJyxcclxuICAgIHNob3dpbmdEZXRhaWxzQ2xzOidzaG93aW5nLWRldGFpbHMnLFxyXG4gICAgdGFibGVDbHM6ICd0YWJsZScsXHJcbiAgICBnYW1lQ2xzOiAnZ2FtZScsXHJcbiAgICBjdXJyZW50Q2xzOiAnY3VycmVudCcsXHJcbiAgICBvdmVybGF5Q2xzOiAnb3ZlcmxheScsXHJcbiAgICByZXN1bHRzOiB7XHJcbiAgICAgICAgd29uOiAnKFswLTldKylcXFxcKycsXHJcbiAgICAgICAgbG9zdDogJyhbMC05XSspXFxcXC0nLFxyXG4gICAgICAgIGppZ286ICcoWzAtOV0rKT0nLFxyXG4gICAgICAgIHVucmVzb2x2ZWQ6ICcoWzAtOV0rKVxcXFw/J1xyXG4gICAgfSxcclxuICAgIHJvdzogMCxcclxuICAgIGNvbHVtbjogMCxcclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJyxcclxuICAgIGhvdmVyaW5nOiB0cnVlLFxyXG4gICAgY2xpY2tpbmc6IHRydWVcclxufTtcclxuXHJcbmNvbnN0IEdSSURfUExBQ0VNRU5UX0FUVFIgPSAnZGF0YS1nby1wbGFjZSc7XHJcbmNvbnN0IE9QUE9ORU5UX0dSSURfUExBQ0VNRU5UX0FUVFIgPSAnZGF0YS1nby1vcHBvbmVudC1wbGFjZSc7XHJcblxyXG4vKipcclxuICogSW5mb3JtcyBpZiB0aGUgd2Vic2l0ZSBpcyBydW4gb24gbW9iaWxlIGJyb3dzZXIuXHJcbiAqIEB0eXBlIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgaXNNb2JpbGUgPSAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XHJcblxyXG4vKipcclxuICogUHJlZml4IGZvciBET00gc2V0dGluZ3NcclxuICogSXQgd2lsbCBiZSBsYXRlciB1c2VkIGFzOiBcImRhdGEtcHJlZml4LWF0dHJpYnV0ZVwiIG9yIFwicHJlZml4LWF0dHJpYnV0ZVwiXHJcbiAqIEB0eXBlIHtzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBBVFRSSUJVVEVTX1BSRUZJWCA9ICdnby1yZXN1bHRzLSc7XHJcblxyXG4vKipcclxuICogTGlzdCBvZiBhdHRyaWJ1dGVzIHRvIGJlIHNlYXJjaGVkIGZvciBpbiBET01cclxuICogQHR5cGUge0FycmF5LjxzdHJpbmc+fVxyXG4gKi9cclxuY29uc3QgQVRUSVJCVVRFUyA9IFsnY29sdW1uJywgJ3JvdyddO1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgYXJyYXktbGlrZSBvYmplY3RzIChzdWNoIGFzIGFyZ3VtZW50cyBvciBub2RlIGxpc3RzKSBpbnRvIGFuIGFycmF5XHJcbiAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48VD59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXNBcnJheShhcnJheUxpa2UpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IGNvbnRhaW5pbmcga2V5cyBvbmx5IGZyb20gZGVmYXVsdE9iaiBidXQgdmFsdWVzIGFyZSB0YWtlblxyXG4gKiBmcm9tIGlmIGV4aXN0IChzdGFydGluZyBmcm9tIHRoZSBsYXN0IG9iamVjdCBwcm92aWRlZClcclxuICogQHBhcmFtIHtvYmplY3R9IGRlZmF1bHRPYmpcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKGRlZmF1bHRPYmosIC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IG92ZXJyaWRlcyA9IG9iamVjdHNcclxuICAgICAgICAuZmlsdGVyKChvYmopID0+IHR5cGVvZiBvYmogPT09ICdvYmplY3QnKVxyXG4gICAgICAgIC5yZXZlcnNlKCk7XHJcblxyXG4gICAgY29uc3QgY291bnQgPSBvdmVycmlkZXMubGVuZ3RoO1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgbWFpbkxvb3A6IGZvciAobGV0IGtleSBpbiBkZWZhdWx0T2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChvdmVycmlkZXNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvdmVycmlkZXNbaV1ba2V5XTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIG1haW5Mb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXN1bHRba2V5XSA9IGRlZmF1bHRPYmpba2V5XTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtcyBtYXAgb2YgcG9zc2libGUgcmVzdWx0cyBpbnRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCByZWdleHAgc3RyaW5nXHJcbiAqIGNvbnZlcnRlZCBpbnRvIFJlZ0V4cCBvYmplY3RzLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzdWx0c1xyXG4gKiBAcmV0dXJucyB7QXJyYXkuPHtjbHM6IHN0cmluZywgcmVnZXhwOiBSZWdFeHB9Pn1cclxuICovXHJcbmZ1bmN0aW9uIG1hcFJlc3VsdHNTZXR0aW5ncyhyZXN1bHRzKSB7XHJcbiAgICBjb25zdCBtYXAgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBjbHMgaW4gcmVzdWx0cykge1xyXG4gICAgICAgIGlmIChyZXN1bHRzLmhhc093blByb3BlcnR5KGNscykpIHtcclxuICAgICAgICAgICAgbWFwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY2xzLFxyXG4gICAgICAgICAgICAgICAgcmVnZXhwOiBuZXcgUmVnRXhwKHJlc3VsdHNbY2xzXSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWFkcyByb3cgYW5kIGNvbHVtbiBzZXR0aW5ncyBmcm9tIHRoZSBET00gZWxlbWVudFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gZ28gcmVzdWx0cyBwbGFjZWhvbGRlclxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBvYmplY3Qgd2l0aCBjb2x1bW4gYW5kIHJvdyBzZXR0aW5ncyBpZiBwcm92aWRlZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREb21TZXR0aW5ncyhlbGVtZW50KSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBBVFRJUkJVVEVTLmZvckVhY2goKGF0dHIpID0+IHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShBVFRSSUJVVEVTX1BSRUZJWCArIGF0dHIpO1xyXG5cclxuICAgICAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIEFUVFJJQlVURVNfUFJFRklYICsgYXR0cik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgcmVzdWx0W2F0dHJdID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0R3JpZFBsYWNlbWVudChyb3csIHBsYWNlbWVudCkge1xyXG4gICAgcm93LnNldEF0dHJpYnV0ZShHUklEX1BMQUNFTUVOVF9BVFRSLCBwbGFjZW1lbnQpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhdmVyc2UgcHJvdmlkZWQgdGFibGUgYW5kIGNyZWF0ZSByZXN1bHRzIG1hcFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZSAtIHRhYmxlIHJlc3VsdHMgY29udGFpbmVyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyAtIG1hbmRhdG9yeSBzZXR0aW5ncyBmb3IgcGFyc2VyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5ncy5yb3dUYWdzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5ncy5jZWxsVGFnc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MucmVzdWx0c1xyXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MuY29sdW1uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncy5yb3dcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXBSb3dzVG9QbGF5ZXJzKHRhYmxlLCBzZXR0aW5ncykge1xyXG4gICAgY29uc3Qgcm93cyA9IGFzQXJyYXkodGFibGUucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5yb3dUYWdzKSk7XHJcbiAgICBjb25zdCByZXN1bHRzTWFwID0gbWFwUmVzdWx0c1NldHRpbmdzKHNldHRpbmdzLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcENvdW50ID0gcmVzdWx0c01hcC5sZW5ndGg7XHJcbiAgICBjb25zdCByZXN1bHRzID0ge307XHJcblxyXG4gICAgbGV0IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgbGV0IGxhc3RHcmlkUGxhY2VtZW50O1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnJvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZWxscyA9IGFzQXJyYXkocm93LnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3MuY2VsbFRhZ3MpKTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHQgcGxhY2VcclxuICAgICAgICBsZXQgZ3JpZFBsYWNlbWVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLyBubyBjZWxscz8gdW5saWtlbHkgdG8gYmUgYSByZXN1bHQgcm93XHJcbiAgICAgICAgaWYgKCFjZWxscy5sZW5ndGggfHwgIWNlbGxzW3NldHRpbmdzLmNvbHVtbl0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNldEdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MuY29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG5cclxuICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldEdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYXNzaWduIHRvdXJuYW1lbnQgaWYgZGVmaW5lZCAocG9zc2libHkgc2hvd2luZyBhbiBleHRyYWN0IGZyb20gZ3JlYXRlciB0YWJsZSlcclxuICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQgfHwgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gbGFzdEdyaWRQbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzdW1wdGlvbjogaWYgcGxhY2UgaXMgbm90IHByb3ZpZGVkIHRoZW4gaXQncyBhbiBleCBhZXF1byBjYXNlIGJ1dFxyXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc2V0IGEgbG93ZXIgcGxhY2Ugbm9uZXRoZWxlc3NcclxuICAgICAgICBpZiAoIXRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID8gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgOiAxO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRvdXJuYW1lbnRQbGFjZW1lbnQgPD0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0ge1xyXG4gICAgICAgICAgICBwbGFjZTogdG91cm5hbWVudFBsYWNlbWVudCxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0c01hcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGwudGV4dENvbnRlbnQubWF0Y2gocmVzdWx0c01hcFtpXS5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRHcmlkUGxhY2VtZW50ID0gTnVtYmVyKG1hdGNoWzFdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShPUFBPTkVOVF9HUklEX1BMQUNFTUVOVF9BVFRSLCBvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudEdyaWRQbGFjZW1lbnRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xzOiByZXN1bHRzTWFwW2ldLmNsc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5vcHBvbmVudHMuc29ydCgoYSwgYikgPT4gYSA+IGIgPyAxIDogLTEpO1xyXG5cclxuICAgICAgICByZXN1bHRzW2dyaWRQbGFjZW1lbnRdID0gcGxheWVyO1xyXG5cclxuICAgICAgICBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgbGFzdEdyaWRQbGFjZW1lbnQgPSBncmlkUGxhY2VtZW50O1xyXG5cclxuICAgICAgICByZXR1cm4gc2V0R3JpZFBsYWNlbWVudChyb3csIGdyaWRQbGFjZW1lbnQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvUmVzdWx0c0hpZ2hsaWdodGVyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIEdvUmVzdWx0c0hpZ2hsaWdodGVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIG1haW4gZWxlbWVudCBjb250YWluaW5nIHRhYmxlIHdpdGggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gLSBwbHVnaW4gc2V0dGluZ3NcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3MuY29sdW1uPTBdIC0gaW5kZXggb2YgdGhlIGNvbHVtblxyXG4gICAgICogd2hlcmUgdGhlIHNjcmlwdCBzaG91bGQgZXhwZWN0IHRvIGZpbmQgcGxheWVyJ3MgcGxhY2VtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLnJvdz0wXSAtIHN0YXJ0aW5nIHJvdyB3aXRoIHBsYXllcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucHJlZml4Q2xzPSdnby1yZXN1bHRzLSddIC0gY3NzIGNsYXNzIHByZWZpeFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5nYW1lQ2xzPSdnYW1lJ10gLSBnYW1lIGNlbGwgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jdXJyZW50Q2xzPSdjdXJyZW50J10gLSBzZWxlY3RlZCByb3cgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yZXN1bHRzXSAtIG1hcCB3aXRoIHBvc3NpYmxlIHJlc3VsdHMsIGJ5IGRlZmF1bHRcclxuICAgICAqIHN1cHBvcnRzIDQgb3B0aW9ucy4gUHJvdmlkZSB3aXRoIFwiY2xhc3NOYW1lXCIgLT4gXCJyZWdleHBcIiBwYXR0ZXJuLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLndvbj0nKFswLTldKylcXFxcKyddIC0gZGVmYXVsdCB3aW5uaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmxvc3Q9JyhbMC05XSspXFxcXC0nXSAtIGRlZmF1bHQgbG9zaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmppZ289JyhbMC05XSspPSddIC0gZGVmYXVsdCBkcmF3IHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLnVucmVzb2x2ZWQ9JyhbMC05XSspXFxcXD9dIC0gZGVmYXVsdCB1bnJlc29sdmVkIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yb3dUYWdzPSd0ciddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZSBzdHJpbmdcclxuICAgICAqIHdpdGggdGFncyByZXByZXNlbnRpbmcgcGxheWVycycgcm93c1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jZWxsVGFncz0ndGQsdGgnXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGVcclxuICAgICAqIHN0cmluZyB3aXRoIHRhZ3MgaG9sZGluZyBnYW1lIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgc2V0dGluZ3MpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgLy8gbm90IHN1cHBvcnRlZFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgcmVhZERvbVNldHRpbmdzKGVsZW1lbnQpLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVyc01hcCgpO1xyXG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MudGFibGVDbHMpO1xyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgcGxheWVycyBtYXBcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUGxheWVyc01hcCgpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcFJvd3NUb1BsYXllcnModGhpcy5lbGVtZW50LCB0aGlzLnNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGxhY2VtZW50IGluIHRoaXMubWFwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShwbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaCh0aGlzLm1hcFtwbGFjZW1lbnRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcmtzIHRoZSByb3cgZm9yIHNlbGVjdGVkIHBsYXllciBhbmQgYSBjZWxsIHdpdGggb3Bwb25lbnRzIGdhbWUgaWZcclxuICAgICAqIHByb3ZpZGVkLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtwbGF5ZXJQbGFjZV0gLSBwbGF5ZXIncyBwbGFjZSwgc2VsZWN0aW9uIHdpbGwgYmUgcmVtb3ZlXHJcbiAgICAgKiBpZiBub3QgcGxheWVyIGlzIGZvdW5kIGZvciBnaXZlbiBwbGFjZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHBvbmVudFBsYWNlXSAtIHBsYXllcidzIG9wcG9uZW50J3MgcGxhY2UgLSB0byBtYXJrXHJcbiAgICAgKiBjZWxscyB3aXRoIGdhbWUgYmV0d2VlbiBwbGF5ZXIgYW5kIHRoZSBvcHBvbmVudFxyXG4gICAgICovXHJcbiAgICBzZWxlY3RQbGF5ZXIocGxheWVyUGxhY2UsIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Q2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmN1cnJlbnRDbHM7XHJcbiAgICAgICAgY29uc3QgZ2FtZUNscyA9IHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5nYW1lQ2xzO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcblxyXG4gICAgICAgIGNvbnN0IG1hcmtlZEdhbWVzID0gYXNBcnJheSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLicgKyBnYW1lQ2xzKSk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgY3VycmVudENscyk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93UGxhY2VtZW50ID0gbWFya2VkUm93ID8gbWFya2VkUm93LmdldEF0dHJpYnV0ZShHUklEX1BMQUNFTUVOVF9BVFRSKSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUGxheWVyID0gbWFya2VkUm93UGxhY2VtZW50ID8gdGhpcy5tYXBbbWFya2VkUm93UGxhY2VtZW50XSA6IG51bGw7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBhbnkgdmlzaWJsZSBnYW1lIG1hcmtpbmdzXHJcbiAgICAgICAgbWFya2VkR2FtZXMuZm9yRWFjaCgoZ2FtZUNlbGwpID0+IHtcclxuICAgICAgICAgICAgZ2FtZUNlbGwuY2xhc3NMaXN0LnJlbW92ZShnYW1lQ2xzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdW5tYXJrIHBsYXllciBpZiBuZWNlc3NhcnlcclxuICAgICAgICBpZiAobWFya2VkUGxheWVyICYmIG1hcmtlZFBsYXllciAhPT0gcGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsuY2FsbCh0aGlzLCBtYXJrZWRQbGF5ZXIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIHBsYXllciBpZiBub3QgYWxyZWFkeSBtYXJrZWRcclxuICAgICAgICBpZiAocGxheWVyICYmIHBsYXllciAhPT0gbWFya2VkUGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsuY2FsbCh0aGlzLCBwbGF5ZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayBhbGwgdGhlIGdhbWVzXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd2luZ0RldGFpbHMpIHtcclxuICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5mb3JFYWNoKChvcHBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRdLmdhbWVzW3BsYXllclBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoZ2FtZUNscyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBnYW1lIGJldHdlZW4gdGhlIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgICAgfSBlbHNlIGlmIChwbGF5ZXIgJiYgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFyayhwbGF5ZXIsIGFjdGl2ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBhY3RpdmUgPyAnYWRkJyA6ICdyZW1vdmUnO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLnJvdy5jbGFzc0xpc3RbbWV0aG9kXShjdXJyZW50Q2xzKTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnRQbGFjZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICAgICAgb3Bwb25lbnQucm93LmNsYXNzTGlzdFttZXRob2RdKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNscyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc3RvcmVzIHByb3BlciBvcmRlciBvZiByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIHJlc3RvcmVGdWxsUmVzdWx0cygpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnNcclxuICAgICAgICAgICAgLmZpbHRlcigocGxheWVyKSA9PiBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAucmV2ZXJzZSgpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3cucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGxheWVyLnJvdywgcGxheWVyLnJvdy5wcm9wZXJOZXh0U2libGluZyk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm93LnByb3Blck5leHRTaWJsaW5nID0gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5zaG93aW5nRGV0YWlsc0Nscyk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvd3MgZGV0YWlscyBmb3Igc2VsZWN0ZWQgcGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXVxyXG4gICAgICovXHJcbiAgICBzaG93RGV0YWlscyhwbGF5ZXJQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gcGxheWVyLnJvdy5wYXJlbnROb2RlO1xyXG4gICAgICAgIGxldCBhZnRlciA9IHBsYXllci5yb3cubmV4dFNpYmxpbmc7XHJcblxyXG4gICAgICAgIHBsYXllci5vcHBvbmVudHMuZm9yRWFjaCgob3Bwb25lbnRQbGFjZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXTtcclxuXHJcbiAgICAgICAgICAgIG9wcG9uZW50LnJvdy5wcm9wZXJOZXh0U2libGluZyA9IG9wcG9uZW50LnJvdy5uZXh0U2libGluZztcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHBvbmVudFBsYWNlIDwgcGxheWVyUGxhY2UpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUob3Bwb25lbnQucm93LCBwbGF5ZXIucm93KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUob3Bwb25lbnQucm93LCBhZnRlcik7XHJcbiAgICAgICAgICAgICAgICBhZnRlciA9IG9wcG9uZW50LnJvdy5uZXh0U2libGluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB1bmZvcnR1bmF0ZWx5IGFwcGx5aW5nIGNsYXNzZXMgb24gbG9uZyB0YWJsZXMgaXMgdmVyeSBleHBlbnNpdmVcclxuICAgICAgICAvLyBvcGVyYXRpb24gY2F1c2luZyBsYWdzLiBJbiBvcmRlciB0byBwcm92aWRlIGJldHRlciBwZXJmb3JtYW5jZVxyXG4gICAgICAgIC8vIGZlZWxpbmcgYSBjbGFzcyBpcyBub3QgYWRkZWQgd2hlbiB0aGUgdGFibGUgZXhjZWVkcyAxMDAgcm93cy5cclxuICAgICAgICBpZiAoIWlzTW9iaWxlIHx8IHRoaXMucGxheWVycy5sZW5ndGggPCAxMDApIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLnNob3dpbmdEZXRhaWxzQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd2luZ0RldGFpbHMgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllclBsYWNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmRzIG1vdXNlb3ZlciBhbmQgbW91c2VvdXQgZXZlbnRzIGxpc3RlbmVycyB0byB0aGUgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgYmluZEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuY2xpY2tpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVGdWxsUmVzdWx0cygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyUGxhY2VtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGFjZW1lbnQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKEdSSURfUExBQ0VNRU5UX0FUVFIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclBsYWNlbWVudCA9IHBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zaG93RGV0YWlscyhwbGF5ZXJQbGFjZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSB8fCB0aGlzLnNob3dpbmdEZXRhaWxzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gZmV0Y2ggaW5mb3JtYXRpb24gYWJvdXQgaG92ZXJlZCBlbGVtZW50XHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50R3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoT1BQT05FTlRfR1JJRF9QTEFDRU1FTlRfQVRUUik7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyR3JpZFBsYWNlbWVudCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoR1JJRF9QTEFDRU1FTlRfQVRUUik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2FtZSBjZWxsP1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wcG9uZW50R3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wcG9uZW50ID0gb3Bwb25lbnRHcmlkUGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllckdyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSBwbGF5ZXJHcmlkUGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXIsIG9wcG9uZW50KTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UgfHwgdGhpcy5zaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCAmJiB0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG5ldyBob3ZlcmVkIGVsZW1lbnQgaXMgb3V0c2lkZSB0aGUgdGFibGUgdGhlbiByZW1vdmUgYWxsXHJcbiAgICAgICAgICAgIC8vIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgaWYgKHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcigtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTOyJdfQ==
(1)
});
