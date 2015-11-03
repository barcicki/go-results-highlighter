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
    gameCls: 'game',
    currentCls: 'current',
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
        row.goGridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.column]) {
            return;
        }

        var tournamentPlacement = parseInt(cells[settings.column].textContent, 10);
        var gridPlacement = undefined;

        // if no player has been mapped
        if (!lastGridPlacement) {

            // most probably not a result row
            if (isNaN(tournamentPlacement)) {
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

                    var opponentGridPlacement = match[1];

                    cell.goOpponentGridPosition = opponentGridPlacement;
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

        row.goGridPlacement = gridPlacement;
        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
        results[gridPlacement] = player;
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
        this.settings = defaults(DEFAULT_SETTINGS, readDomSettings(element), settings);
        this.map = mapRowsToPlayers(this.element, this.settings);

        this.bindEvents();
    }

    /**
     * Marks the row for selected player and a cell with opponents game if
     * provided.
     * @param {number} [playerPlace] - player's place, selection will be remove
     * if not player is found for given place
     * @param {number} [opponentPlace] - player's opponent's place - to mark
     * cells with game between player and the opponent
     */

    _createClass(GoResultsHighlighter, [{
        key: 'selectPlayer',
        value: function selectPlayer(playerPlace, opponentPlace) {
            var currentCls = this.settings.prefixCls + this.settings.currentCls;
            var gameCls = this.settings.prefixCls + this.settings.gameCls;

            var player = this.map[playerPlace];

            var markedGames = asArray(this.element.querySelectorAll('.' + gameCls));
            var markedRow = this.element.querySelector('.' + currentCls);
            var markedPlayer = markedRow && markedRow.goGridPlacement ? this.map[markedRow.goGridPlacement] : null;

            // remove any visible game markings
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = markedGames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var gameCell = _step4.value;

                    gameCell.classList.remove(gameCls);
                }

                // unmark player if necessary
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
         * Shows details for selected player
         * @param {number} [playerPlace]
         */
    }, {
        key: 'showDetails',
        value: function showDetails(playerPlace) {
            console.log('Showing', playerPlace);
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

                var target = event.target;
                var playerPlacement = null;

                // fetch information about hovered element
                while (target && target !== document) {

                    // player row? no further search is necessary
                    if (target.goGridPlacement) {
                        playerPlacement = target.goGridPlacement;
                        break;
                    }

                    target = target.parentNode;
                }

                if (!playerPlacement) {
                    return;
                }

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

                    // game cell?
                    if (target.goOpponentGridPosition) {
                        opponent = target.goOpponentGridPosition;
                    }

                    // player row? no further search is necessary
                    if (target.goGridPlacement) {
                        player = target.goGridPlacement;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL2Zha2VfN2FjNmUxZTMuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NyYy9wbHVnaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztzQkNBOEMsVUFBVTs7OztBQUV4RCxTQUFTLFVBQVUsR0FBRztBQUNsQixRQUFNLGNBQWMsR0FBRyxxQkFBUSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0FBRTVGLDZCQUFvQixjQUFjLDhIQUFFO2dCQUEzQixPQUFPOztBQUNaLG1CQUFPLENBQUMsb0JBQW9CLEdBQUcsd0JBQXlCLE9BQU8sQ0FBQyxDQUFDO1NBQ3BFOzs7Ozs7Ozs7Ozs7Ozs7Q0FDSjs7QUFFRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO0FBQ3BDLGNBQVUsRUFBRSxDQUFDO0NBQ2hCLE1BQU07QUFDSCxZQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFOzs7Ozs7QUNkRCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNTixJQUFNLGdCQUFnQixHQUFHO0FBQzVCLGFBQVMsRUFBRSxhQUFhO0FBQ3hCLFdBQU8sRUFBRSxNQUFNO0FBQ2YsY0FBVSxFQUFFLFNBQVM7QUFDckIsV0FBTyxFQUFFO0FBQ0wsV0FBRyxFQUFFLGFBQWE7QUFDbEIsWUFBSSxFQUFFLGFBQWE7QUFDbkIsWUFBSSxFQUFFLFdBQVc7QUFDakIsa0JBQVUsRUFBRSxhQUFhO0tBQzVCO0FBQ0QsT0FBRyxFQUFFLENBQUM7QUFD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ZUFBZSxFQUFFO0FBQ3hCLDhCQUFNLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUNoQyw4QkFBTTtxQkFDVDs7QUFFRCwwQkFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7aUJBQzlCOztBQUVELG9CQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1QsMkJBQU87aUJBQ1Y7O0FBRUQsc0JBQUssWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN2QyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVWLGdCQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNqRCxvQkFBSSxNQUFLLFFBQVEsQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO0FBQ2xDLDJCQUFPO2lCQUNWOztBQUVELG9CQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDOztBQUVqQyx1QkFBTyxNQUFNLElBQUksTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBSyxPQUFPLEVBQUU7QUFDN0QsMEJBQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2lCQUM5Qjs7OztBQUlELG9CQUFJLE1BQU0sS0FBSyxNQUFLLE9BQU8sRUFBRTtBQUN6QiwwQkFBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekI7YUFDSixFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2I7OztXQTdLZ0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQjs7QUFnTHpDLG9CQUFvQixDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBHb1Jlc3VsdHNIaWdobGlnaHRlciwgeyBhc0FycmF5IH0gZnJvbSAnLi9wbHVnaW4nO1xyXG5cclxuZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcclxuICAgIGNvbnN0IHJlc3VsdEVsZW1lbnRzID0gYXNBcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZ28tcmVzdWx0c10sW2RhdGEtZ28tcmVzdWx0c10nKSk7XHJcblxyXG4gICAgZm9yIChsZXQgdGFibGVFbCBvZiByZXN1bHRFbGVtZW50cykge1xyXG4gICAgICAgIHRhYmxlRWwuZ29SZXN1bHRzSGlnaGxpZ2h0ZXIgPSBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIodGFibGVFbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICBpbml0aWFsaXplKCk7XHJcbn0gZWxzZSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdGlhbGl6ZSwgZmFsc2UpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHb1Jlc3VsdHNIaWdobGlnaHRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBzZXR0aW5ncyBvZiB0aGUgcGx1Z2luXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcclxuICAgIHByZWZpeENsczogJ2dvLXJlc3VsdHMtJyxcclxuICAgIGdhbWVDbHM6ICdnYW1lJyxcclxuICAgIGN1cnJlbnRDbHM6ICdjdXJyZW50JyxcclxuICAgIHJlc3VsdHM6IHtcclxuICAgICAgICB3b246ICcoWzAtOV0rKVxcXFwrJyxcclxuICAgICAgICBsb3N0OiAnKFswLTldKylcXFxcLScsXHJcbiAgICAgICAgamlnbzogJyhbMC05XSspPScsXHJcbiAgICAgICAgdW5yZXNvbHZlZDogJyhbMC05XSspXFxcXD8nXHJcbiAgICB9LFxyXG4gICAgcm93OiAwLFxyXG4gICAgY29sdW1uOiAwLFxyXG4gICAgcm93VGFnczogJ3RyJyxcclxuICAgIGNlbGxUYWdzOiAndGQsdGgnLFxyXG4gICAgaG92ZXJpbmc6IHRydWUsXHJcbiAgICBjbGlja2luZzogdHJ1ZVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByZWZpeCBmb3IgRE9NIHNldHRpbmdzXHJcbiAqIEl0IHdpbGwgYmUgbGF0ZXIgdXNlZCBhczogXCJkYXRhLXByZWZpeC1hdHRyaWJ1dGVcIiBvciBcInByZWZpeC1hdHRyaWJ1dGVcIlxyXG4gKiBAdHlwZSB7c3RyaW5nfVxyXG4gKi9cclxuY29uc3QgQVRUUklCVVRFU19QUkVGSVggPSAnZ28tcmVzdWx0cy0nO1xyXG5cclxuLyoqXHJcbiAqIExpc3Qgb2YgYXR0cmlidXRlcyB0byBiZSBzZWFyY2hlZCBmb3IgaW4gRE9NXHJcbiAqIEB0eXBlIHtBcnJheS48c3RyaW5nPn1cclxuICovXHJcbmNvbnN0IEFUVElSQlVURVMgPSBbJ2NvbHVtbicsICdyb3cnXTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGFycmF5LWxpa2Ugb2JqZWN0cyAoc3VjaCBhcyBhcmd1bWVudHMgb3Igbm9kZSBsaXN0cykgaW50byBhbiBhcnJheVxyXG4gKiBAcGFyYW0geyp9IGFycmF5TGlrZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFQ+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzQXJyYXkoYXJyYXlMaWtlKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCBjb250YWluaW5nIGtleXMgb25seSBmcm9tIGRlZmF1bHRPYmogYnV0IHZhbHVlcyBhcmUgdGFrZW5cclxuICogZnJvbSBpZiBleGlzdCAoc3RhcnRpbmcgZnJvbSB0aGUgbGFzdCBvYmplY3QgcHJvdmlkZWQpXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0T2JqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG9iamVjdD59IG9iamVjdHNcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cyhkZWZhdWx0T2JqLCAuLi5vYmplY3RzKSB7XHJcbiAgICBjb25zdCBvdmVycmlkZXMgPSBvYmplY3RzXHJcbiAgICAgICAgLmZpbHRlcigob2JqKSA9PiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JylcclxuICAgICAgICAucmV2ZXJzZSgpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0ge307XHJcblxyXG4gICAgbWFpbkxvb3A6IGZvciAobGV0IGtleSBpbiBkZWZhdWx0T2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgb2JqIG9mIG92ZXJyaWRlcykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgY29udGludWUgbWFpbkxvb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlc3VsdFtrZXldID0gZGVmYXVsdE9ialtrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIG1hcCBvZiBwb3NzaWJsZSByZXN1bHRzIGludG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHJlZ2V4cCBzdHJpbmdcclxuICogY29udmVydGVkIGludG8gUmVnRXhwIG9iamVjdHMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXN1bHRzXHJcbiAqIEByZXR1cm5zIHtBcnJheS48e2Nsczogc3RyaW5nLCByZWdleHA6IFJlZ0V4cH0+fVxyXG4gKi9cclxuZnVuY3Rpb24gbWFwUmVzdWx0c1NldHRpbmdzKHJlc3VsdHMpIHtcclxuICAgIGNvbnN0IG1hcCA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGNscyBpbiByZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMuaGFzT3duUHJvcGVydHkoY2xzKSkge1xyXG4gICAgICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjbHMsXHJcbiAgICAgICAgICAgICAgICByZWdleHA6IG5ldyBSZWdFeHAocmVzdWx0c1tjbHNdKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlYWRzIHJvdyBhbmQgY29sdW1uIHNldHRpbmdzIGZyb20gdGhlIERPTSBlbGVtZW50XHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBnbyByZXN1bHRzIHBsYWNlaG9sZGVyXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IG9iamVjdCB3aXRoIGNvbHVtbiBhbmQgcm93IHNldHRpbmdzIGlmIHByb3ZpZGVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZERvbVNldHRpbmdzKGVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGF0dHIgb2YgQVRUSVJCVVRFUykge1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKEFUVFJJQlVURVNfUFJFRklYICsgYXR0cik7XHJcblxyXG4gICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgQVRUUklCVVRFU19QUkVGSVggKyBhdHRyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXN1bHRbYXR0cl0gPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYXZlcnNlIHByb3ZpZGVkIHRhYmxlIGFuZCBjcmVhdGUgcmVzdWx0cyBtYXBcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFibGUgLSB0YWJsZSByZXN1bHRzIGNvbnRhaW5lclxyXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBtYW5kYXRvcnkgc2V0dGluZ3MgZm9yIHBhcnNlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3Mucm93VGFnc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ3MuY2VsbFRhZ3NcclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzLnJlc3VsdHNcclxuICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzLmNvbHVtblxyXG4gKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3Mucm93XHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFwUm93c1RvUGxheWVycyh0YWJsZSwgc2V0dGluZ3MpIHtcclxuICAgIGNvbnN0IHJvd3MgPSBhc0FycmF5KHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3Mucm93VGFncykpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IG1hcFJlc3VsdHNTZXR0aW5ncyhzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcclxuXHJcbiAgICBsZXQgbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICBsZXQgbGFzdEdyaWRQbGFjZW1lbnQ7XHJcblxyXG4gICAgcm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgc2V0dGluZ3Mucm93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXNBcnJheShyb3cucXVlcnlTZWxlY3RvckFsbChzZXR0aW5ncy5jZWxsVGFncykpO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gZGVmYXVsdCBwbGFjZVxyXG4gICAgICAgIHJvdy5nb0dyaWRQbGFjZW1lbnQgPSAtMTtcclxuXHJcbiAgICAgICAgLy8gbm8gY2VsbHM/IHVubGlrZWx5IHRvIGJlIGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmICghY2VsbHMubGVuZ3RoIHx8ICFjZWxsc1tzZXR0aW5ncy5jb2x1bW5dKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3VybmFtZW50UGxhY2VtZW50ID0gcGFyc2VJbnQoY2VsbHNbc2V0dGluZ3MuY29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG4gICAgICAgIGxldCBncmlkUGxhY2VtZW50O1xyXG5cclxuICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gdG91cm5hbWVudCBpZiBkZWZpbmVkIChwb3NzaWJseSBzaG93aW5nIGFuIGV4dHJhY3QgZnJvbSBncmVhdGVyIHRhYmxlKVxyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudCB8fCAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBsYXN0R3JpZFBsYWNlbWVudCArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgYSBsb3dlciBwbGFjZSBub25ldGhlbGVzc1xyXG4gICAgICAgIGlmICghdG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPyBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA6IDE7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodG91cm5hbWVudFBsYWNlbWVudCA8PSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB7XHJcbiAgICAgICAgICAgIHBsYWNlOiB0b3VybmFtZW50UGxhY2VtZW50LFxyXG4gICAgICAgICAgICByb3csXHJcbiAgICAgICAgICAgIGdhbWVzOiB7fSxcclxuICAgICAgICAgICAgb3Bwb25lbnRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcmVzdWx0IG9mIHJlc3VsdHNNYXApIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGwudGV4dENvbnRlbnQubWF0Y2gocmVzdWx0LnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudEdyaWRQbGFjZW1lbnQgPSBtYXRjaFsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjZWxsLmdvT3Bwb25lbnRHcmlkUG9zaXRpb24gPSBvcHBvbmVudEdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRHcmlkUGxhY2VtZW50XSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsczogcmVzdWx0LmNsc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJvdy5nb0dyaWRQbGFjZW1lbnQgPSBncmlkUGxhY2VtZW50O1xyXG4gICAgICAgIGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBsYXN0R3JpZFBsYWNlbWVudCA9IGdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgcmVzdWx0c1tncmlkUGxhY2VtZW50XSA9IHBsYXllcjtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb1Jlc3VsdHNIaWdobGlnaHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBHb1Jlc3VsdHNIaWdobGlnaHRlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBtYWluIGVsZW1lbnQgY29udGFpbmluZyB0YWJsZSB3aXRoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIC0gcGx1Z2luIHNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLmNvbHVtbj0wXSAtIGluZGV4IG9mIHRoZSBjb2x1bW5cclxuICAgICAqIHdoZXJlIHRoZSBzY3JpcHQgc2hvdWxkIGV4cGVjdCB0byBmaW5kIHBsYXllcidzIHBsYWNlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5yb3c9MF0gLSBzdGFydGluZyByb3cgd2l0aCBwbGF5ZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnByZWZpeENscz0nZ28tcmVzdWx0cy0nXSAtIGNzcyBjbGFzcyBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuZ2FtZUNscz0nZ2FtZSddIC0gZ2FtZSBjZWxsIGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY3VycmVudENscz0nY3VycmVudCddIC0gc2VsZWN0ZWQgcm93IGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3MucmVzdWx0c10gLSBtYXAgd2l0aCBwb3NzaWJsZSByZXN1bHRzLCBieSBkZWZhdWx0XHJcbiAgICAgKiBzdXBwb3J0cyA0IG9wdGlvbnMuIFByb3ZpZGUgd2l0aCBcImNsYXNzTmFtZVwiIC0+IFwicmVnZXhwXCIgcGF0dGVybi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy53b249JyhbMC05XSspXFxcXCsnXSAtIGRlZmF1bHQgd2lubmluZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5sb3N0PScoWzAtOV0rKVxcXFwtJ10gLSBkZWZhdWx0IGxvc2luZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5qaWdvPScoWzAtOV0rKT0nXSAtIGRlZmF1bHQgZHJhdyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy51bnJlc29sdmVkPScoWzAtOV0rKVxcXFw/XSAtIGRlZmF1bHQgdW5yZXNvbHZlZCByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFncz0ndHInXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGUgc3RyaW5nXHJcbiAgICAgKiB3aXRoIHRhZ3MgcmVwcmVzZW50aW5nIHBsYXllcnMnIHJvd3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY2VsbFRhZ3M9J3RkLHRoJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlXHJcbiAgICAgKiBzdHJpbmcgd2l0aCB0YWdzIGhvbGRpbmcgZ2FtZSByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdHMoREVGQVVMVF9TRVRUSU5HUywgcmVhZERvbVNldHRpbmdzKGVsZW1lbnQpLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXBSb3dzVG9QbGF5ZXJzKHRoaXMuZWxlbWVudCwgdGhpcy5zZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgdGhlIHJvdyBmb3Igc2VsZWN0ZWQgcGxheWVyIGFuZCBhIGNlbGwgd2l0aCBvcHBvbmVudHMgZ2FtZSBpZlxyXG4gICAgICogcHJvdmlkZWQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXSAtIHBsYXllcidzIHBsYWNlLCBzZWxlY3Rpb24gd2lsbCBiZSByZW1vdmVcclxuICAgICAqIGlmIG5vdCBwbGF5ZXIgaXMgZm91bmQgZm9yIGdpdmVuIHBsYWNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wcG9uZW50UGxhY2VdIC0gcGxheWVyJ3Mgb3Bwb25lbnQncyBwbGFjZSAtIHRvIG1hcmtcclxuICAgICAqIGNlbGxzIHdpdGggZ2FtZSBiZXR3ZWVuIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgKi9cclxuICAgIHNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSwgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuY3VycmVudENscztcclxuICAgICAgICBjb25zdCBnYW1lQ2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmdhbWVDbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGdhbWVDbHMpKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBjdXJyZW50Q2xzKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRQbGF5ZXIgPSBtYXJrZWRSb3cgJiYgbWFya2VkUm93LmdvR3JpZFBsYWNlbWVudCA/IHRoaXMubWFwW21hcmtlZFJvdy5nb0dyaWRQbGFjZW1lbnRdIDogbnVsbDtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIGFueSB2aXNpYmxlIGdhbWUgbWFya2luZ3NcclxuICAgICAgICBmb3IgKGxldCBnYW1lQ2VsbCBvZiBtYXJrZWRHYW1lcykge1xyXG4gICAgICAgICAgICBnYW1lQ2VsbC5jbGFzc0xpc3QucmVtb3ZlKGdhbWVDbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdW5tYXJrIHBsYXllciBpZiBuZWNlc3NhcnlcclxuICAgICAgICBpZiAobWFya2VkUGxheWVyICYmIG1hcmtlZFBsYXllciAhPT0gcGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsuY2FsbCh0aGlzLCBtYXJrZWRQbGF5ZXIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIHBsYXllciBpZiBub3QgYWxyZWFkeSBtYXJrZWRcclxuICAgICAgICBpZiAocGxheWVyICYmIHBsYXllciAhPT0gbWFya2VkUGxheWVyKSB7XHJcbiAgICAgICAgICAgIG1hcmsuY2FsbCh0aGlzLCBwbGF5ZXIsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgZ2FtZSBiZXR3ZWVuIHRoZSBwbGF5ZXIgYW5kIHRoZSBvcHBvbmVudFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXS5nYW1lc1twbGF5ZXJQbGFjZV0uY2VsbC5jbGFzc0xpc3QuYWRkKGdhbWVDbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFyayhwbGF5ZXIsIGFjdGl2ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBhY3RpdmUgPyAnYWRkJyA6ICdyZW1vdmUnO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLnJvdy5jbGFzc0xpc3RbbWV0aG9kXShjdXJyZW50Q2xzKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG9wcG9uZW50UGxhY2Ugb2YgcGxheWVyLm9wcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV07XHJcblxyXG4gICAgICAgICAgICAgICAgb3Bwb25lbnQucm93LmNsYXNzTGlzdFttZXRob2RdKHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNscyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93cyBkZXRhaWxzIGZvciBzZWxlY3RlZCBwbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcGxheWVyUGxhY2VdXHJcbiAgICAgKi9cclxuICAgIHNob3dEZXRhaWxzKHBsYXllclBsYWNlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Nob3dpbmcnLCBwbGF5ZXJQbGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyBtb3VzZW92ZXIgYW5kIG1vdXNlb3V0IGV2ZW50cyBsaXN0ZW5lcnMgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGJpbmRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNsaWNraW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyUGxhY2VtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwbGF5ZXIgcm93PyBubyBmdXJ0aGVyIHNlYXJjaCBpcyBuZWNlc3NhcnlcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuZ29HcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyUGxhY2VtZW50ID0gdGFyZ2V0LmdvR3JpZFBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXJQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zaG93RGV0YWlscyhwbGF5ZXJQbGFjZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmhvdmVyaW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgcGxheWVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGZldGNoIGluZm9ybWF0aW9uIGFib3V0IGhvdmVyZWQgZWxlbWVudFxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnYW1lIGNlbGw/XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LmdvT3Bwb25lbnRHcmlkUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHBvbmVudCA9IHRhcmdldC5nb09wcG9uZW50R3JpZFBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5nb0dyaWRQbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSB0YXJnZXQuZ29HcmlkUGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBsYXllcihwbGF5ZXIsIG9wcG9uZW50KTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ob3ZlcmluZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQgJiYgdGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBuZXcgaG92ZXJlZCBlbGVtZW50IGlzIG91dHNpZGUgdGhlIHRhYmxlIHRoZW4gcmVtb3ZlIGFsbFxyXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQbGF5ZXIoLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5Hb1Jlc3VsdHNIaWdobGlnaHRlci5ERUZBVUxUX1NFVFRJTkdTID0gREVGQVVMVF9TRVRUSU5HUzsiXX0=
(1)
});
