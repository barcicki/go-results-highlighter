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
    cellTags: 'td,th'
};

exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */

function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object containing keys only from defualtObj but values will be
 * taken from obj first if exist
 * @param {object} obj
 * @param {object} defaultObj
 * @returns {object}
 */

function defaults(obj, defaultObj) {
    var result = {};

    if (!obj) {
        obj = {};
    }

    for (var key in defaultObj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        } else {
            result[key] = defaultObj[key];
        }
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
 * Traverse provided table and create results map
 * @param {HTMLElement} table - table results container
 * @param {object} [settings] - settings for parser
 * @param {string} [settings.rowTags]
 * @param {string} [settings.cellTags]
 * @param {object} [settings.results]
 * @param {object} [settings.column]
 * @param {object} [settings.row]
 * @returns {object}
 */

function mapRowsToPlayers(table, settings) {
    var config = defaults(settings, DEFAULT_SETTINGS);
    var rows = asArray(table.querySelectorAll(config.rowTags));
    var resultsMap = mapResultsSettings(config.results);
    var results = {};

    var lastTournamentPlacement = undefined;
    var lastGridPlacement = undefined;

    rows.forEach(function (row, index) {
        if (index < config.row) {
            return;
        }

        var cells = asArray(row.querySelectorAll(config.cellTags));

        // assign default place
        row.goGridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[config.column]) {
            return;
        }

        var tournamentPlacement = parseInt(cells[config.column].textContent, 10);
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = resultsMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var result = _step.value;

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
        this.settings = defaults(settings, DEFAULT_SETTINGS);
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
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = markedGames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var gameCell = _step2.value;

                    gameCell.classList.remove(gameCls);
                }

                // unmark player if necessary
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

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = player.opponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _opponentPlace = _step3.value;

                        var opponent = this.map[_opponentPlace];

                        opponent.row.classList[method](this.settings.prefixCls + player.games[_opponentPlace].cls);
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
            }
        }

        /**
         * Binds mouseover and mouseout events listeners to the element.
         */
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this = this;

            this.element.addEventListener('mouseover', function (event) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvZmFrZV9lYzJlY2VhOS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3NCQ0E4QyxVQUFVOzs7O0FBRXhELFNBQVMsVUFBVSxHQUFHO0FBQ2xCLFFBQU0sY0FBYyxHQUFHLHFCQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7QUFFNUYsNkJBQW9CLGNBQWMsOEhBQUU7Z0JBQTNCLE9BQU87O0FBQ1osbUJBQU8sQ0FBQyxvQkFBb0IsR0FBRyx3QkFBeUIsT0FBTyxDQUFDLENBQUM7U0FDcEU7Ozs7Ozs7Ozs7Ozs7OztDQUNKOztBQUVELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7QUFDcEMsY0FBVSxFQUFFLENBQUM7Q0FDaEIsTUFBTTtBQUNILFlBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDcEU7Ozs7OztBQ2RELFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTU4sSUFBTSxnQkFBZ0IsR0FBRztBQUM1QixhQUFTLEVBQUUsYUFBYTtBQUN4QixXQUFPLEVBQUUsTUFBTTtBQUNmLGNBQVUsRUFBRSxTQUFTO0FBQ3JCLFdBQU8sRUFBRTtBQUNMLFdBQUcsRUFBRSxhQUFhO0FBQ2xCLFlBQUksRUFBRSxhQUFhO0FBQ25CLFlBQUksRUFBRSxXQUFXO0FBQ2pCLGtCQUFVLEVBQUUsYUFBYTtLQUM1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QUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sS0FBSyxNQUFLLE9BQU8sRUFBRTtBQUM3RCwwQkFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7aUJBQzlCOzs7O0FBSUQsb0JBQUksTUFBTSxLQUFLLE1BQUssT0FBTyxFQUFFO0FBQ3pCLDBCQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUN4QjthQUNKLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDYjs7O1dBbElnQixvQkFBb0I7OztxQkFBcEIsb0JBQW9COztBQXFJekMsb0JBQW9CLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEdvUmVzdWx0c0hpZ2hsaWdodGVyLCB7IGFzQXJyYXkgfSBmcm9tICcuL3BsdWdpbic7XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgY29uc3QgcmVzdWx0RWxlbWVudHMgPSBhc0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tnby1yZXN1bHRzXSxbZGF0YS1nby1yZXN1bHRzXScpKTtcclxuXHJcbiAgICBmb3IgKGxldCB0YWJsZUVsIG9mIHJlc3VsdEVsZW1lbnRzKSB7XHJcbiAgICAgICAgdGFibGVFbC5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZUVsKTtcclxuICAgIH1cclxufVxyXG5cclxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgIGluaXRpYWxpemUoKTtcclxufSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0aWFsaXplLCBmYWxzZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdvUmVzdWx0c0hpZ2hsaWdodGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHNldHRpbmdzIG9mIHRoZSBwbHVnaW5cclxuICogQHR5cGUge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xyXG4gICAgcHJlZml4Q2xzOiAnZ28tcmVzdWx0cy0nLFxyXG4gICAgZ2FtZUNsczogJ2dhbWUnLFxyXG4gICAgY3VycmVudENsczogJ2N1cnJlbnQnLFxyXG4gICAgcmVzdWx0czoge1xyXG4gICAgICAgIHdvbjogJyhbMC05XSspXFxcXCsnLFxyXG4gICAgICAgIGxvc3Q6ICcoWzAtOV0rKVxcXFwtJyxcclxuICAgICAgICBqaWdvOiAnKFswLTldKyk9JyxcclxuICAgICAgICB1bnJlc29sdmVkOiAnKFswLTldKylcXFxcPydcclxuICAgIH0sXHJcbiAgICByb3c6IDAsXHJcbiAgICBjb2x1bW46IDAsXHJcbiAgICByb3dUYWdzOiAndHInLFxyXG4gICAgY2VsbFRhZ3M6ICd0ZCx0aCdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIGFycmF5LWxpa2Ugb2JqZWN0cyAoc3VjaCBhcyBhcmd1bWVudHMgb3Igbm9kZSBsaXN0cykgaW50byBhbiBhcnJheVxyXG4gKiBAcGFyYW0geyp9IGFycmF5TGlrZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFQ+fVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzQXJyYXkoYXJyYXlMaWtlKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyYXlMaWtlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbmV3IG9iamVjdCBjb250YWluaW5nIGtleXMgb25seSBmcm9tIGRlZnVhbHRPYmogYnV0IHZhbHVlcyB3aWxsIGJlXHJcbiAqIHRha2VuIGZyb20gb2JqIGZpcnN0IGlmIGV4aXN0XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmpcclxuICogQHBhcmFtIHtvYmplY3R9IGRlZmF1bHRPYmpcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cyhvYmosIGRlZmF1bHRPYmopIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuICAgIGlmICghb2JqKSB7XHJcbiAgICAgICAgb2JqID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQga2V5IGluIGRlZmF1bHRPYmopIHtcclxuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IGRlZmF1bHRPYmpba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgbWFwIG9mIHBvc3NpYmxlIHJlc3VsdHMgaW50byBhcnJheSBvZiBvYmplY3RzIHdpdGggcmVnZXhwIHN0cmluZ1xyXG4gKiBjb252ZXJ0ZWQgaW50byBSZWdFeHAgb2JqZWN0cy5cclxuICogQHBhcmFtIHtvYmplY3R9IHJlc3VsdHNcclxuICogQHJldHVybnMge0FycmF5Ljx7Y2xzOiBzdHJpbmcsIHJlZ2V4cDogUmVnRXhwfT59XHJcbiAqL1xyXG5mdW5jdGlvbiBtYXBSZXN1bHRzU2V0dGluZ3MocmVzdWx0cykge1xyXG4gICAgY29uc3QgbWFwID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgY2xzIGluIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAocmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShjbHMpKSB7XHJcbiAgICAgICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNscyxcclxuICAgICAgICAgICAgICAgIHJlZ2V4cDogbmV3IFJlZ0V4cChyZXN1bHRzW2Nsc10pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmF2ZXJzZSBwcm92aWRlZCB0YWJsZSBhbmQgY3JlYXRlIHJlc3VsdHMgbWFwXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhYmxlIC0gdGFibGUgcmVzdWx0cyBjb250YWluZXJcclxuICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gLSBzZXR0aW5ncyBmb3IgcGFyc2VyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFnc11cclxuICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jZWxsVGFnc11cclxuICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yZXN1bHRzXVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW3NldHRpbmdzLmNvbHVtbl1cclxuICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yb3ddXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFwUm93c1RvUGxheWVycyh0YWJsZSwgc2V0dGluZ3MpIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGRlZmF1bHRzKHNldHRpbmdzLCBERUZBVUxUX1NFVFRJTkdTKTtcclxuICAgIGNvbnN0IHJvd3MgPSBhc0FycmF5KHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoY29uZmlnLnJvd1RhZ3MpKTtcclxuICAgIGNvbnN0IHJlc3VsdHNNYXAgPSBtYXBSZXN1bHRzU2V0dGluZ3MoY29uZmlnLnJlc3VsdHMpO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xyXG5cclxuICAgIGxldCBsYXN0VG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgIGxldCBsYXN0R3JpZFBsYWNlbWVudDtcclxuXHJcbiAgICByb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcclxuICAgICAgICBpZiAoaW5kZXggPCBjb25maWcucm93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gYXNBcnJheShyb3cucXVlcnlTZWxlY3RvckFsbChjb25maWcuY2VsbFRhZ3MpKTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGRlZmF1bHQgcGxhY2VcclxuICAgICAgICByb3cuZ29HcmlkUGxhY2VtZW50ID0gLTE7XHJcblxyXG4gICAgICAgIC8vIG5vIGNlbGxzPyB1bmxpa2VseSB0byBiZSBhIHJlc3VsdCByb3dcclxuICAgICAgICBpZiAoIWNlbGxzLmxlbmd0aCB8fCAhY2VsbHNbY29uZmlnLmNvbHVtbl0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRvdXJuYW1lbnRQbGFjZW1lbnQgPSBwYXJzZUludChjZWxsc1tjb25maWcuY29sdW1uXS50ZXh0Q29udGVudCwgMTApO1xyXG4gICAgICAgIGxldCBncmlkUGxhY2VtZW50O1xyXG5cclxuICAgICAgICAvLyBpZiBubyBwbGF5ZXIgaGFzIGJlZW4gbWFwcGVkXHJcbiAgICAgICAgaWYgKCFsYXN0R3JpZFBsYWNlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgLy8gbW9zdCBwcm9iYWJseSBub3QgYSByZXN1bHQgcm93XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0b3VybmFtZW50UGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gdG91cm5hbWVudCBpZiBkZWZpbmVkIChwb3NzaWJseSBzaG93aW5nIGFuIGV4dHJhY3QgZnJvbSBncmVhdGVyIHRhYmxlKVxyXG4gICAgICAgICAgICBncmlkUGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudCB8fCAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdyaWRQbGFjZW1lbnQgPSBsYXN0R3JpZFBsYWNlbWVudCArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgYSBsb3dlciBwbGFjZSBub25ldGhlbGVzc1xyXG4gICAgICAgIGlmICghdG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQgPyBsYXN0VG91cm5hbWVudFBsYWNlbWVudCA6IDE7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodG91cm5hbWVudFBsYWNlbWVudCA8PSBsYXN0VG91cm5hbWVudFBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICB0b3VybmFtZW50UGxhY2VtZW50ID0gbGFzdFRvdXJuYW1lbnRQbGFjZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB7XHJcbiAgICAgICAgICAgIHBsYWNlOiB0b3VybmFtZW50UGxhY2VtZW50LFxyXG4gICAgICAgICAgICByb3csXHJcbiAgICAgICAgICAgIGdhbWVzOiB7fSxcclxuICAgICAgICAgICAgb3Bwb25lbnRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcmVzdWx0IG9mIHJlc3VsdHNNYXApIHtcclxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGNlbGwudGV4dENvbnRlbnQubWF0Y2gocmVzdWx0LnJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudEdyaWRQbGFjZW1lbnQgPSBtYXRjaFsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICBjZWxsLmdvT3Bwb25lbnRHcmlkUG9zaXRpb24gPSBvcHBvbmVudEdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRHcmlkUGxhY2VtZW50XSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsczogcmVzdWx0LmNsc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudEdyaWRQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJvdy5nb0dyaWRQbGFjZW1lbnQgPSBncmlkUGxhY2VtZW50O1xyXG4gICAgICAgIGxhc3RUb3VybmFtZW50UGxhY2VtZW50ID0gdG91cm5hbWVudFBsYWNlbWVudDtcclxuICAgICAgICBsYXN0R3JpZFBsYWNlbWVudCA9IGdyaWRQbGFjZW1lbnQ7XHJcbiAgICAgICAgcmVzdWx0c1tncmlkUGxhY2VtZW50XSA9IHBsYXllcjtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb1Jlc3VsdHNIaWdobGlnaHRlciB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIG5ldyBpbnN0YW5jZSBvZiBHb1Jlc3VsdHNIaWdobGlnaHRlclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBtYWluIGVsZW1lbnQgY29udGFpbmluZyB0YWJsZSB3aXRoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIC0gcGx1Z2luIHNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NldHRpbmdzLmNvbHVtbj0wXSAtIGluZGV4IG9mIHRoZSBjb2x1bW5cclxuICAgICAqIHdoZXJlIHRoZSBzY3JpcHQgc2hvdWxkIGV4cGVjdCB0byBmaW5kIHBsYXllcidzIHBsYWNlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzZXR0aW5ncy5yb3c9MF0gLSBzdGFydGluZyByb3cgd2l0aCBwbGF5ZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NldHRpbmdzLnByZWZpeENscz0nZ28tcmVzdWx0cy0nXSAtIGNzcyBjbGFzcyBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuZ2FtZUNscz0nZ2FtZSddIC0gZ2FtZSBjZWxsIGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY3VycmVudENscz0nY3VycmVudCddIC0gc2VsZWN0ZWQgcm93IGNsYXNzIG5hbWVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3MucmVzdWx0c10gLSBtYXAgd2l0aCBwb3NzaWJsZSByZXN1bHRzLCBieSBkZWZhdWx0XHJcbiAgICAgKiBzdXBwb3J0cyA0IG9wdGlvbnMuIFByb3ZpZGUgd2l0aCBcImNsYXNzTmFtZVwiIC0+IFwicmVnZXhwXCIgcGF0dGVybi5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy53b249JyhbMC05XSspXFxcXCsnXSAtIGRlZmF1bHQgd2lubmluZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5sb3N0PScoWzAtOV0rKVxcXFwtJ10gLSBkZWZhdWx0IGxvc2luZyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy5qaWdvPScoWzAtOV0rKT0nXSAtIGRlZmF1bHQgZHJhdyByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucmVzdWx0cy51bnJlc29sdmVkPScoWzAtOV0rKVxcXFw/XSAtIGRlZmF1bHQgdW5yZXNvbHZlZCByZWdleHBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3Mucm93VGFncz0ndHInXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGUgc3RyaW5nXHJcbiAgICAgKiB3aXRoIHRhZ3MgcmVwcmVzZW50aW5nIHBsYXllcnMnIHJvd3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MuY2VsbFRhZ3M9J3RkLHRoJ10gLSBxdWVyeVNlbGVjdGlvbi1jb21wYXRpYmxlXHJcbiAgICAgKiBzdHJpbmcgd2l0aCB0YWdzIGhvbGRpbmcgZ2FtZSByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdHMoc2V0dGluZ3MsIERFRkFVTFRfU0VUVElOR1MpO1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwUm93c1RvUGxheWVycyh0aGlzLmVsZW1lbnQsIHRoaXMuc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcmtzIHRoZSByb3cgZm9yIHNlbGVjdGVkIHBsYXllciBhbmQgYSBjZWxsIHdpdGggb3Bwb25lbnRzIGdhbWUgaWZcclxuICAgICAqIHByb3ZpZGVkLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtwbGF5ZXJQbGFjZV0gLSBwbGF5ZXIncyBwbGFjZSwgc2VsZWN0aW9uIHdpbGwgYmUgcmVtb3ZlXHJcbiAgICAgKiBpZiBub3QgcGxheWVyIGlzIGZvdW5kIGZvciBnaXZlbiBwbGFjZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHBvbmVudFBsYWNlXSAtIHBsYXllcidzIG9wcG9uZW50J3MgcGxhY2UgLSB0byBtYXJrXHJcbiAgICAgKiBjZWxscyB3aXRoIGdhbWUgYmV0d2VlbiBwbGF5ZXIgYW5kIHRoZSBvcHBvbmVudFxyXG4gICAgICovXHJcbiAgICBzZWxlY3RQbGF5ZXIocGxheWVyUGxhY2UsIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Q2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmN1cnJlbnRDbHM7XHJcbiAgICAgICAgY29uc3QgZ2FtZUNscyA9IHRoaXMuc2V0dGluZ3MucHJlZml4Q2xzICsgdGhpcy5zZXR0aW5ncy5nYW1lQ2xzO1xyXG5cclxuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLm1hcFtwbGF5ZXJQbGFjZV07XHJcblxyXG4gICAgICAgIGNvbnN0IG1hcmtlZEdhbWVzID0gYXNBcnJheSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLicgKyBnYW1lQ2xzKSk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUm93ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgY3VycmVudENscyk7XHJcbiAgICAgICAgY29uc3QgbWFya2VkUGxheWVyID0gbWFya2VkUm93ICYmIG1hcmtlZFJvdy5nb0dyaWRQbGFjZW1lbnQgPyB0aGlzLm1hcFttYXJrZWRSb3cuZ29HcmlkUGxhY2VtZW50XSA6IG51bGw7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBhbnkgdmlzaWJsZSBnYW1lIG1hcmtpbmdzXHJcbiAgICAgICAgZm9yIChsZXQgZ2FtZUNlbGwgb2YgbWFya2VkR2FtZXMpIHtcclxuICAgICAgICAgICAgZ2FtZUNlbGwuY2xhc3NMaXN0LnJlbW92ZShnYW1lQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVubWFyayBwbGF5ZXIgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKG1hcmtlZFBsYXllciAmJiBtYXJrZWRQbGF5ZXIgIT09IHBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgbWFya2VkUGxheWVyLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBwbGF5ZXIgaWYgbm90IGFscmVhZHkgbWFya2VkXHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBwbGF5ZXIgIT09IG1hcmtlZFBsYXllcikge1xyXG4gICAgICAgICAgICBtYXJrLmNhbGwodGhpcywgcGxheWVyLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1hcmsgdGhlIGdhbWUgYmV0d2VlbiB0aGUgcGxheWVyIGFuZCB0aGUgb3Bwb25lbnRcclxuICAgICAgICBpZiAocGxheWVyICYmIG9wcG9uZW50UGxhY2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLmdhbWVzW29wcG9uZW50UGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICAgICAgdGhpcy5tYXBbb3Bwb25lbnRQbGFjZV0uZ2FtZXNbcGxheWVyUGxhY2VdLmNlbGwuY2xhc3NMaXN0LmFkZChnYW1lQ2xzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hcmsocGxheWVyLCBhY3RpdmUpIHtcclxuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5yb3cuY2xhc3NMaXN0W21ldGhvZF0oY3VycmVudENscyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBvcHBvbmVudFBsYWNlIG9mIHBsYXllci5vcHBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IHRoaXMubWFwW29wcG9uZW50UGxhY2VdO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wcG9uZW50LnJvdy5jbGFzc0xpc3RbbWV0aG9kXSh0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZHMgbW91c2VvdmVyIGFuZCBtb3VzZW91dCBldmVudHMgbGlzdGVuZXJzIHRvIHRoZSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBiaW5kRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgbGV0IG9wcG9uZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBmZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBob3ZlcmVkIGVsZW1lbnRcclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2FtZSBjZWxsP1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5nb09wcG9uZW50R3JpZFBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQgPSB0YXJnZXQuZ29PcHBvbmVudEdyaWRQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwbGF5ZXIgcm93PyBubyBmdXJ0aGVyIHNlYXJjaCBpcyBuZWNlc3NhcnlcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuZ29HcmlkUGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyID0gdGFyZ2V0LmdvR3JpZFBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RQbGF5ZXIocGxheWVyLCBvcHBvbmVudCk7XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0ICYmIHRhcmdldCAhPT0gZG9jdW1lbnQgJiYgdGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBuZXcgaG92ZXJlZCBlbGVtZW50IGlzIG91dHNpZGUgdGhlIHRhYmxlIHRoZW4gcmVtb3ZlIGFsbFxyXG4gICAgICAgICAgICAvLyBzZWxlY3Rpb25zXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQbGF5ZXIoLTEpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdvUmVzdWx0c0hpZ2hsaWdodGVyLkRFRkFVTFRfU0VUVElOR1MgPSBERUZBVUxUX1NFVFRJTkdTOyJdfQ==
(1)
});
