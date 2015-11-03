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

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = resultElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var tableEl = _step.value;

            tableEl.goResultsHighlighter = new _plugin2['default'](tableEl);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
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
    disabledCls: 'disabled',
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
    var result = {};

    mainLoop: for (var key in defaultObj) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = overrides[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                    continue mainLoop;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = ATTIRBUTES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var attr = _step2.value;

            var value = element.getAttribute(ATTRIBUTES_PREFIX + attr);

            if (!value) {
                value = element.getAttribute('data-' + ATTRIBUTES_PREFIX + attr);
            }

            if (value) {
                result[attr] = value;
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

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
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = resultsMap[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var result = _step3.value;

                    var match = cell.textContent.match(result.regexp);

                    if (!match) {
                        continue;
                    }

                    var opponentGridPlacement = Number(match[1]);

                    cell.setAttribute(OPPONENT_GRID_PLACEMENT_ATTR, opponentGridPlacement);

                    player.games[opponentGridPlacement] = {
                        cell: cell,
                        cls: result.cls
                    };
                    player.opponents.push(opponentGridPlacement);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                        _iterator3['return']();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
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
            var currentCls = this.settings.prefixCls + this.settings.currentCls;
            var gameCls = this.settings.prefixCls + this.settings.gameCls;

            var player = this.map[playerPlace];

            var markedGames = asArray(this.element.querySelectorAll('.' + gameCls));
            var markedRow = this.element.querySelector('.' + currentCls);
            var markedRowPlacement = markedRow ? markedRow.getAttribute(GRID_PLACEMENT_ATTR) : null;
            var markedPlayer = markedRowPlacement ? this.map[markedRowPlacement] : null;

            // remove any visible game markings
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = markedGames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var gameCell = _step4.value;

                    gameCell.classList.remove(gameCls);
                }

                // if showing details then allow only highlighting current player
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this.showingDetails && player && !player.row.classList.contains(currentCls)) {
                return;
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
                var method = active ? 'add' : 'remove';

                player.row.classList[method](currentCls);

                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = player.opponents[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _opponentPlace = _step5.value;

                        var opponent = this.map[_opponentPlace];

                        opponent.row.classList[method](this.settings.prefixCls + player.games[_opponentPlace].cls);
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                            _iterator5['return']();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }
            }
        }

        /**
         * Restores proper order of results, removes any disabling flags
         */
    }, {
        key: 'restoreFullResults',
        value: function restoreFullResults() {
            var disabledCls = this.settings.prefixCls + this.settings.disabledCls;

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.players[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var player = _step6.value;

                    player.row.parentNode.appendChild(player.row);
                    player.row.classList.remove(disabledCls);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                        _iterator6['return']();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            this.showingDetails = false;
        }

        /**
         * Shows details for selected player
         * @param {number} [playerPlace]
         */
    }, {
        key: 'showDetails',
        value: function showDetails(playerPlace) {
            var player = this.map[playerPlace];

            if (!player) {
                return;
            }

            var disabledCls = this.settings.prefixCls + this.settings.disabledCls;
            var parent = player.row.parentNode;
            var after = player.row.nextSibling;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.players[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var otherPlayer = _step7.value;

                    otherPlayer.row.classList.add(disabledCls);
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                        _iterator7['return']();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = player.opponents[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var opponentPlace = _step8.value;

                    var opponent = this.map[opponentPlace];

                    if (opponentPlace < playerPlace) {
                        parent.insertBefore(opponent.row, player.row);
                    } else {
                        parent.insertBefore(opponent.row, after);
                        after = opponent.row.nextSibling;
                    }

                    opponent.row.classList.remove(disabledCls);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                        _iterator8['return']();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            player.row.classList.remove(disabledCls);
            this.showingDetails = true;
        }

        /**
         * Binds mouseover and mouseout events listeners to the element.
         */
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this = this;

            this.element.addEventListener('click', function (event) {
                if (_this.settings.clicking === false) {
                    return;
                }

                if (_this.showingDetails) {
                    _this.restoreFullResults();
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

                _this.selectPlayer(playerPlacement);
                _this.showDetails(playerPlacement);
            });

            this.element.addEventListener('mouseover', function (event) {
                if (_this.settings.hovering === false) {
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

                _this.selectPlayer(player, opponent);
            }, false);

            this.element.addEventListener('mouseout', function (event) {
                if (_this.settings.hovering === false) {
                    return;
                }

                var target = event.relatedTarget;

                while (target && target !== document && target !== _this.element) {
                    target = target.parentNode;
                }

                // if new hovered element is outside the table then remove all
                // selections
                if (target !== _this.element) {
                    _this.selectPlayer(-1);
                }
            }, false);
        }
    }]);

    return GoResultsHighlighter;
})();

exports['default'] = GoResultsHighlighter;

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL2Zha2VfNDY5NWMxY2UuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NyYy9wbHVnaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztzQkNBOEMsVUFBVTs7OztBQUV4RCxTQUFTLFVBQVUsR0FBRztBQUNsQixRQUFNLGNBQWMsR0FBRyxxQkFBUSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0FBRTVGLDZCQUFvQixjQUFjLDhIQUFFO2dCQUEzQixPQUFPOztBQUNaLG1CQUFPLENBQUMsb0JBQW9CLEdBQUcsd0JBQXlCLE9BQU8sQ0FBQyxDQUFDO1NBQ3BFOzs7Ozs7Ozs7Ozs7Ozs7Q0FDSjs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOzs7Ozs7QUNkRCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNTixJQUFNLGdCQUFnQixHQUFHO0FBQzVCLGFBQVMsRUFBRSxhQUFhO0FBQ3hCLGVBQVcsRUFBRSxVQUFVO0FBQ3ZCLFlBQVEsRUFBRSxPQUFPO0FBQ2pCLFdBQU8sRUFBRSxNQUFNO0FBQ2YsY0FBVSxFQUFFLFNBQVM7QUFDckIsY0FBVSxFQUFFLFNBQVM7QUFDckIsV0FBTyxFQUFFO0FBQ0wsV0FBRyxFQUFFLGFBQWE7QUFDbEIsWUFBSSxFQUFFLGFBQWE7QUFDbkIsWUFB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QzlCOztBQUVELG9CQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1QsMkJBQU87aUJBQ1Y7O0FBRUQsc0JBQUssWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN2QyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVWLGdCQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNqRCxvQkFBSSxNQUFLLFFBQVEsQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO0FBQ2xDLDJCQUFPO2lCQUNWOztBQUVELG9CQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDOztBQUVqQyx1QkFBTyxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBSyxPQUFPLEVBQUU7QUFDN0QsMEJBQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2lCQUM5Qjs7OztBQUlELG9CQUFJLE1BQU0sS0FBSyxNQUFLLE9BQU8sRUFBRTtBQUN6QiwwQkFBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekI7YUFDSixFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2I7OztXQTdQZ0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQjs7QUFnUXpDLG9CQUFvQixDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBHb1Jlc3VsdHNIaWdobGlnaHRlciwgeyBhc0FycmF5IH0gZnJvbSAnLi9wbHVnaW4nO1xyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgIGNvbnN0IHJlc3VsdEVsZW1lbnRzID0gYXNBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZ28tcmVzdWx0c10sW2RhdGEtZ28tcmVzdWx0c10nKSk7XHJcblxyXG4gICAgZm9yIChsZXQgdGFibGVFbCBvZiByZXN1bHRFbGVtZW50cykge1xyXG4gICAgICAgIHRhYmxlRWwuZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIodGFibGVFbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbn0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZSwgZmFsc2UpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICAgIHByZWZpeENsczogJ2dvLXJlc3VsdHMtJyxcclxuICAgIGRpc2FibGVkQ2xzOiAnZGlzYWJsZWQnLFxyXG4gICAgdGFibGVDbHM6ICd0YWJsZScsXHJcbiAgICBnYW1lQ2xzOiAnZ2FtZScsXHJcbiAgICBjdXJyZW50Q2xzOiAnY3VycmVudCcsXHJcbiAgICBvdmVybGF5Q2xzOiAnb3ZlcmxheScsXHJcbiAgICByZXN1bHRzOiB7XHJcbiAgICAgICAgd29uOiAnKFswLTldKylcXFxcKycsXHJcbiAgICAgICAgbG9zdDogJyhbMC05XSspXFxcXC0nLFxyXG4gICAgICAgIGppZ286ICcoWzAtOV0rKT0nLFxyXG4gICAgICAgIHVucmVzb2x2ZWQ6ICcoWzAtOV0rKVxcXFw/J1xyXG4gICAgfSxcclxuICAgIHJvdzogMCxcclxuICAgIGNvbHVtbjogMCxcclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJyxcclxuICAgIGhvdmVyaW5nOiB0cnVlLFxyXG4gICAgY2xpY2tpbmc6IHRydWVcclxufTtcclxuXHJcbmNvbnN0IEdSSURfUExBQ0VNRU5UX0FUVFIgPSAnZGF0YS1nby1wbGFjZSc7XHJcbmNvbnN0IE9QUE9ORU5UX0dSSURfUExBQ0VNRU5UX0FUVFIgPSAnZGF0YS1nby1vcHBvbmVudC1wbGFjZSc7XHJcblxyXG4vKipcclxuICogUHJlZml4IGZvciBET00gc2V0dGluZ3NcclxuICogSXQgd2lsbCBiZSBsYXRlciB1c2VkIGFzOiBcImRhdGEtcHJlZml4LWF0dHJpYnV0ZVwiIG9yIFwicHJlZml4LWF0dHJpYnV0ZVwiXHJcbiAqIEB0eXBlIHtzdHJpbmd9XHJcbiAqL1xyXG5jb25zdCBBVFRSSUJVVEVTX1BSRUZJWCA9ICdnby1yZXN1bHRzLSc7XHJcblxyXG4vKipcclxuICogTGlzdCBvZiBhdHRyaWJ1dGVzIHRvIGJlIHNlYXJjaGVkIGZvciBpbiBET01cclxuICogQHR5cGUge0FycmF5LjxzdHJpbmc+fVxyXG4gKi9cclxuY29uc3QgQVRUSVJCVVRFUyA9IFsnY29sdW1uJywgJ3JvdyddO1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgYXJyYXktbGlrZSBvYmplY3RzIChzdWNoIGFzIGFyZ3VtZW50cyBvciBub2RlIGxpc3RzKSBpbnRvIGFuIGFycmF5XHJcbiAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48VD59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXNBcnJheShhcnJheUxpa2UpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IGNvbnRhaW5pbmcga2V5cyBvbmx5IGZyb20gZGVmYXVsdE9iaiBidXQgdmFsdWVzIGFyZSB0YWtlblxyXG4gKiBmcm9tIGlmIGV4aXN0IChzdGFydGluZyBmcm9tIHRoZSBsYXN0IG9iamVjdCBwcm92aWRlZClcclxuICogQHBhcmFtIHtvYmplY3R9IGRlZmF1bHRPYmpcclxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gb2JqZWN0c1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKGRlZmF1bHRPYmosIC4uLm9iamVjdHMpIHtcclxuICAgIGNvbnN0IG92ZXJyaWRlcyA9IG9iamVjdHNcclxuICAgICAgICAuZmlsdGVyKChvYmopID0+IHR5cGVvZiBvYmogPT09ICdvYmplY3QnKVxyXG4gICAgICAgIC5yZXZlcnNlKCk7XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuXHJcbiAgICBtYWluTG9vcDogZm9yIChsZXQga2V5IGluIGRlZmF1bHRPYmopIHtcclxuICAgICAgICBmb3IgKGxldCBvYmogb2Ygb3ZlcnJpZGVzKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqW2tleV07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZSBtYWluTG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzdWx0W2tleV0gPSBkZWZhdWx0T2JqW2tleV07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgbWFwIG9mIHBvc3NpYmxlIHJlc3VsdHMgaW50byBhcnJheSBvZiBvYmplY3RzIHdpdGggcmVnZXhwIHN0cmluZ1xyXG4gKiBjb252ZXJ0ZWQgaW50byBSZWdFeHAgb2JqZWN0cy5cclxuICogQHBhcmFtIHtvYmplY3R9IHJlc3VsdHNcclxuICogQHJldHVybnMge0FycmF5Ljx7Y2xzOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwfT59XHJcbiAqL1xyXG5mdW5jdGlvbiBtYXBSZXN1bHRzU2V0dGluZ3MocmVzdWx0cykge1xyXG4gICAgY29uc3QgbWFwID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgY2xzIGluIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAocmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShjbHMpKSB7XHJcbiAgICAgICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNscyxcclxuICAgICAgICAgICAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChyZXN1bHRzW2Nsc10pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFwO1xyXG59XHJcblxyXG4vKipcclxuICogUmVhZHMgcm93IGFuZCBjb2x1bW4gc2V0dGluZ3MgZnJvbSB0aGUgRE9NIGVsZW1lbnRcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIGdvIHJlc3VsdHMgcGxhY2Vob2xkZXJcclxuICogQHJldHVybnMge29iamVjdH0gb2JqZWN0IHdpdGggY29sdW1uIGFuZCByb3cgc2V0dGluZ3MgaWYgcHJvdmlkZWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkRG9tU2V0dGluZ3MoZWxlbWVudCkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgZm9yIChsZXQgYXR0ciBvZiBBVFRJUkJVVEVTKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoQVRUUklCVVRFU19QUkVGSVggKyBhdHRyKTtcclxuXHJcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBBVFRSSUJVVEVTX1BSRUZJWCArIGF0dHIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFthdHRyXSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRHcmlkUGxhY2VtZW50KHJvdywgcGxhY2VtZW50KSB7XHJcbiAgICByb3cuc2V0QXR0cmlidXRlKEdSSURfUExBQ0VNRU5UX0FUVFIsIHBsYWNlbWVudCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBwcm92aWRlZCB0YWJsZSBhbmQgY3JlYXRlIHJlc3VsdHMgbWFwXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlIC0gdGFibGUgcmVzdWx0cyBjb250YWluZXJcclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gbWFuZGF0b3J5IHNldHRpbmdzIGZvciBwYXJzZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLnJvd1RhZ3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLmNlbGxUYWdzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncy5yZXN1bHRzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncy5jb2x1bW5cclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzLnJvd1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1hcFJvd3NUb1BsYXllcnModGFibGUsIHNldHRpbmdzKSB7XHJcbiAgICBjb25zdCByb3dzID0gYXNBcnJheSh0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLnJvd1RhZ3MpKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSBtYXBSZXN1bHRzU2V0dGluZ3Moc2V0dGluZ3MucmVzdWx0cyk7XHJcbiAgICBjb25zdCByZXN1bHRzID0ge307XHJcblxyXG4gICAgbGV0IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgbGV0IGxhc3RHcmlkUGxhY2VtZW50O1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmIChpbmRleCA8IHNldHRpbmdzLnJvdykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZWxscyA9IGFzQXJyYXkocm93LnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3MuY2VsbFRhZ3MpKTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHQgcGxhY2VcclxuICAgICAgICBsZXQgZ3JpZFBsYWNlbWVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLyBubyBjZWxscz8gdW5saWtlbHkgdG8gYmUgYSByZXN1bHQgcm93XHJcbiAgICAgICAgaWYgKCFjZWxscy5sZW5ndGggfHwgIWNlbGxzW3NldHRpbmdzLmNvbHVtbl0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNldEdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MuY29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG5cclxuICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldEdyaWRQbGFjZW1lbnQocm93LCBncmlkUGxhY2VtZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYXNzaWduIHRvdXJuYW1lbnQgaWYgZGVmaW5lZCAocG9zc2libHkgc2hvd2luZyBhbiBleHRyYWN0IGZyb20gZ3JlYXRlciB0YWJsZSlcclxuICAgICAgICAgICAgZ3JpZFBsYWNlbWVudCA9IHRvdXJuYW1lbnRQbGFjZW1lbnQgfHwgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gbGFzdEdyaWRQbGFjZW1lbnQgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzdW1wdGlvbjogaWYgcGxhY2UgaXMgbm90IHByb3ZpZGVkIHRoZW4gaXQncyBhbiBleCBhZXF1byBjYXNlIGJ1dFxyXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc2V0IGEgbG93ZXIgcGxhY2Ugbm9uZXRoZWxlc3NcclxuICAgICAgICBpZiAoIXRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID8gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgOiAxO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRvdXJuYW1lbnRQbGFjZW1lbnQgPD0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgdG91cm5hbWVudFBsYWNlbWVudCA9IGxhc3RUb3VybmFtZW50UGxhY2VtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0ge1xyXG4gICAgICAgICAgICBwbGFjZTogdG91cm5hbWVudFBsYWNlbWVudCxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlc3VsdCBvZiByZXN1bHRzTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsLnRleHRDb250ZW50Lm1hdGNoKHJlc3VsdC5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRHcmlkUGxhY2VtZW50ID0gTnVtYmVyKG1hdGNoWzFdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjZWxsLnNldEF0dHJpYnV0ZShPUFBPTkVOVF9HUklEX1BMQUNFTUVOVF9BVFRSLCBvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudEdyaWRQbGFjZW1lbnRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xzOiByZXN1bHQuY2xzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLm9wcG9uZW50cy5wdXNoKG9wcG9uZW50R3JpZFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLm9wcG9uZW50cy5zb3J0KChhLCBiKSA9PiBhID4gYiA/IDEgOiAtMSk7XHJcblxyXG4gICAgICAgIHJlc3VsdHNbZ3JpZFBsYWNlbWVudF0gPSBwbGF5ZXI7XHJcblxyXG4gICAgICAgIGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBsYXN0R3JpZFBsYWNlbWVudCA9IGdyaWRQbGFjZW1lbnQ7XHJcblxyXG4gICAgICAgIHJldHVybiBzZXRHcmlkUGxhY2VtZW50KHJvdywgZ3JpZFBsYWNlbWVudCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29SZXN1bHRzSGlnaGxpZ2h0ZXIge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBuZXcgaW5zdGFuY2Ugb2YgR29SZXN1bHRzSGlnaGxpZ2h0ZXJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IC0gbWFpbiBlbGVtZW50IGNvbnRhaW5pbmcgdGFibGUgd2l0aCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzXSAtIHBsdWdpbiBzZXR0aW5nc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5jb2x1bW49MF0gLSBpbmRleCBvZiB0aGUgY29sdW1uXHJcbiAgICAgKiB3aGVyZSB0aGUgc2NyaXB0IHNob3VsZCBleHBlY3QgdG8gZmluZCBwbGF5ZXIncyBwbGFjZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2V0dGluZ3Mucm93PTBdIC0gc3RhcnRpbmcgcm93IHdpdGggcGxheWVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5wcmVmaXhDbHM9J2dvLXJlc3VsdHMtJ10gLSBjc3MgY2xhc3MgcHJlZml4XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmdhbWVDbHM9J2dhbWUnXSAtIGdhbWUgY2VsbCBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmN1cnJlbnRDbHM9J2N1cnJlbnQnXSAtIHNlbGVjdGVkIHJvdyBjbGFzcyBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzLnJlc3VsdHNdIC0gbWFwIHdpdGggcG9zc2libGUgcmVzdWx0cywgYnkgZGVmYXVsdFxyXG4gICAgICogc3VwcG9ydHMgNCBvcHRpb25zLiBQcm92aWRlIHdpdGggXCJjbGFzc05hbWVcIiAtPiBcInJlZ2V4cFwiIHBhdHRlcm4uXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMud29uPScoWzAtOV0rKVxcXFwrJ10gLSBkZWZhdWx0IHdpbm5pbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMubG9zdD0nKFswLTldKylcXFxcLSddIC0gZGVmYXVsdCBsb3NpbmcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMuamlnbz0nKFswLTldKyk9J10gLSBkZWZhdWx0IGRyYXcgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJlc3VsdHMudW5yZXNvbHZlZD0nKFswLTldKylcXFxcP10gLSBkZWZhdWx0IHVucmVzb2x2ZWQgcmVnZXhwXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnJvd1RhZ3M9J3RyJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlIHN0cmluZ1xyXG4gICAgICogd2l0aCB0YWdzIHJlcHJlc2VudGluZyBwbGF5ZXJzJyByb3dzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLmNlbGxUYWdzPSd0ZCx0aCddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZVxyXG4gICAgICogc3RyaW5nIHdpdGggdGFncyBob2xkaW5nIGdhbWUgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAvLyBub3Qgc3VwcG9ydGVkXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBkZWZhdWx0cyhERUZBVUxUX1NFVFRJTkdTLCByZWFkRG9tU2V0dGluZ3MoZWxlbWVudCksIHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXJzTWFwKCk7XHJcbiAgICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy50YWJsZUNscyk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBwbGF5ZXJzIG1hcFxyXG4gICAgICovXHJcbiAgICBjcmVhdGVQbGF5ZXJzTWFwKCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwUm93c1RvUGxheWVycyh0aGlzLmVsZW1lbnQsIHRoaXMuc2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwbGFjZW1lbnQgaW4gdGhpcy5tYXApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KHBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKHRoaXMubWFwW3BsYWNlbWVudF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgdGhlIHJvdyBmb3Igc2VsZWN0ZWQgcGxheWVyIGFuZCBhIGNlbGwgd2l0aCBvcHBvbmVudHMgZ2FtZSBpZlxyXG4gICAgICogcHJvdmlkZWQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXSAtIHBsYXllcidzIHBsYWNlLCBzZWxlY3Rpb24gd2lsbCBiZSByZW1vdmVcclxuICAgICAqIGlmIG5vdCBwbGF5ZXIgaXMgZm91bmQgZm9yIGdpdmVuIHBsYWNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wcG9uZW50UGxhY2VdIC0gcGxheWVyJ3Mgb3Bwb25lbnQncyBwbGFjZSAtIHRvIG1hcmtcclxuICAgICAqIGNlbGxzIHdpdGggZ2FtZSBiZXR3ZWVuIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgKi9cclxuICAgIHNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSwgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuY3VycmVudENscztcclxuICAgICAgICBjb25zdCBnYW1lQ2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmdhbWVDbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGdhbWVDbHMpKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBjdXJyZW50Q2xzKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3dQbGFjZW1lbnQgPSBtYXJrZWRSb3cgPyBtYXJrZWRSb3cuZ2V0QXR0cmlidXRlKEdSSURfUExBQ0VNRU5UX0FUVFIpIDogbnVsbDtcclxuICAgICAgICBjb25zdCBtYXJrZWRQbGF5ZXIgPSBtYXJrZWRSb3dQbGFjZW1lbnQgPyB0aGlzLm1hcFttYXJrZWRSb3dQbGFjZW1lbnRdIDogbnVsbDtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGFueSB2aXNpYmxlIGdhbWUgbWFya2luZ3NcclxuICAgICAgICBmb3IgKGxldCBnYW1lQ2VsbCBvZiBtYXJrZWRHYW1lcykge1xyXG4gICAgICAgICAgICBnYW1lQ2VsbC5jbGFzc0xpc3QucmVtb3ZlKGdhbWVDbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgc2hvd2luZyBkZXRhaWxzIHRoZW4gYWxsb3cgb25seSBoaWdobGlnaHRpbmcgY3VycmVudCBwbGF5ZXJcclxuICAgICAgICBpZiAodGhpcy5zaG93aW5nRGV0YWlscyAmJiBwbGF5ZXIgJiYgIXBsYXllci5yb3cuY2xhc3NMaXN0LmNvbnRhaW5zKGN1cnJlbnRDbHMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgbWFya2VkUGxheWVyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBwbGF5ZXIgaWYgbm90IGFscmVhZHkgbWFya2VkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBwbGF5ZXIgIT09IG1hcmtlZFBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgcGxheWVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIGdhbWUgYmV0d2VlbiB0aGUgcGxheWVyIGFuZCB0aGUgb3Bwb25lbnRcclxuICAgICAgICBpZiAocGxheWVyICYmIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hcmsocGxheWVyLCBhY3RpdmUpIHtcclxuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0W21ldGhvZF0oY3VycmVudENscyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBvcHBvbmVudFBsYWNlIG9mIHBsYXllci5vcHBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3RbbWV0aG9kXSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdG9yZXMgcHJvcGVyIG9yZGVyIG9mIHJlc3VsdHMsIHJlbW92ZXMgYW55IGRpc2FibGluZyBmbGFnc1xyXG4gICAgICovXHJcbiAgICByZXN0b3JlRnVsbFJlc3VsdHMoKSB7XHJcbiAgICAgICAgY29uc3QgZGlzYWJsZWRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuZGlzYWJsZWRDbHM7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgcGxheWVyLnJvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHBsYXllci5yb3cpO1xyXG4gICAgICAgICAgICBwbGF5ZXIucm93LmNsYXNzTGlzdC5yZW1vdmUoZGlzYWJsZWRDbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaG93aW5nRGV0YWlscyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvd3MgZGV0YWlscyBmb3Igc2VsZWN0ZWQgcGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXVxyXG4gICAgICovXHJcbiAgICBzaG93RGV0YWlscyhwbGF5ZXJQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGlzYWJsZWRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuZGlzYWJsZWRDbHM7XHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gcGxheWVyLnJvdy5wYXJlbnROb2RlO1xyXG4gICAgICAgIGxldCBhZnRlciA9IHBsYXllci5yb3cubmV4dFNpYmxpbmc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG90aGVyUGxheWVyIG9mIHRoaXMucGxheWVycykge1xyXG4gICAgICAgICAgICBvdGhlclBsYXllci5yb3cuY2xhc3NMaXN0LmFkZChkaXNhYmxlZENscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBvcHBvbmVudFBsYWNlIG9mIHBsYXllci5vcHBvbmVudHMpIHtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICBpZiAob3Bwb25lbnRQbGFjZSA8IHBsYXllclBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgcGxheWVyLnJvdyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG9wcG9uZW50LnJvdywgYWZ0ZXIpO1xyXG4gICAgICAgICAgICAgICAgYWZ0ZXIgPSBvcHBvbmVudC5yb3cubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3QucmVtb3ZlKGRpc2FibGVkQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0LnJlbW92ZShkaXNhYmxlZENscyk7XHJcbiAgICAgICAgdGhpcy5zaG93aW5nRGV0YWlscyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93aW5nRGV0YWlscykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlRnVsbFJlc3VsdHMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IHBsYXllclBsYWNlbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShHUklEX1BMQUNFTUVOVF9BVFRSKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwbGF5ZXIgcm93PyBubyBmdXJ0aGVyIHNlYXJjaCBpcyBuZWNlc3NhcnlcclxuICAgICAgICAgICAgICAgIGlmIChwbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJQbGFjZW1lbnQgPSBwbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllclBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0RldGFpbHMocGxheWVyUGxhY2VtZW50KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRHcmlkUGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShPUFBPTkVOVF9HUklEX1BMQUNFTUVOVF9BVFRSKTtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXJHcmlkUGxhY2VtZW50ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShHUklEX1BMQUNFTUVOVF9BVFRSKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnYW1lIGNlbGw/XHJcbiAgICAgICAgICAgICAgICBpZiAob3Bwb25lbnRHcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQgPSBvcHBvbmVudEdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcGxheWVyIHJvdz8gbm8gZnVydGhlciBzZWFyY2ggaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyR3JpZFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllciA9IHBsYXllckdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllciwgb3Bwb25lbnQpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQucmVsYXRlZFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCAmJiB0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIG5ldyBob3ZlcmVkIGVsZW1lbnQgaXMgb3V0c2lkZSB0aGUgdGFibGUgdGhlbiByZW1vdmUgYWxsXHJcbiAgICAgICAgICAgIC8vIHNlbGVjdGlvbnNcclxuICAgICAgICAgICAgaWYgKHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcigtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTOyJdfQ==
(1)
});
