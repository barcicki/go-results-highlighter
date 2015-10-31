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

    console.log('Initialized');
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
    rowTags: 'tr',
    cellTags: 'td,th'
};

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */

function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object with at values from defaultObj and obj.
 * @param {object} obj
 * @param {object} defaultObj
 * @returns {object}
 */

function defaults(obj, defaultObj) {
    if (typeof obj !== 'object') {
        return Object.assign({}, defaultObj);
    }

    return Object.assign({}, defaultObj, obj);
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
 * @param {object} settings - settings for parser
 * @param {string} settings.rowTags
 * @param {string} settings.cellTags
 * @param {object} settings.results
 * @returns {object}
 */

function mapRowsToPlayers(table, settings) {
    var rows = asArray(table.querySelectorAll(settings.rowTags));
    var resultsMap = mapResultsSettings(settings.results);
    var results = [];

    var lastPlace = undefined;

    rows.forEach(function (row) {
        var cells = asArray(row.querySelectorAll(settings.cellTags));

        // assign default place
        row.goResultPlace = -1;

        // no cells? unlikely to be a result row
        if (!cells.length) {
            return;
        }

        var place = parseInt(cells[0].textContent, 10);

        // most probably not a result row
        if (isNaN(place) && !lastPlace) {
            return;
        }

        // assumption: if place is not provided then it's an ex aequo case but
        // we need to set a lower place nonetheless
        if (!place) {
            place = lastPlace ? lastPlace + 1 : 1;
        } else if (place <= lastPlace) {
            place = lastPlace + 1;
        }

        var player = {
            place: place,
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

                    var opponentPlace = match[1];

                    cell.goOpponentPlace = opponentPlace;
                    player.games[opponentPlace] = {
                        cell: cell,
                        cls: result.cls
                    };
                    player.opponents.push(opponentPlace);
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

        row.goResultPlace = place;
        lastPlace = place;
        results[place] = player;
    });

    return results;
}

var GoResultsHighlighter = (function () {

    /**
     * Creates new instance of GoResultsHighlighter
     *
     * @param {HTMLElement} element - main element containing table with results
     * @param {object} [settings] - plugin settings
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
            var markedPlayer = markedRow && markedRow.goResultPlace ? this.map[markedRow.goResultPlace] : null;

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
                    if (target.goOpponentPlace) {
                        opponent = target.goOpponentPlace;
                    }

                    // player row? no further search is necessary
                    if (target.goResultPlace) {
                        player = target.goResultPlace;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zcmMvZmFrZV80MTYzNTUyZC5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc3JjL3BsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O3NCQ0E4QyxVQUFVOzs7O0FBRXhELFNBQVMsVUFBVSxHQUFHO0FBQ2xCLFFBQU0sY0FBYyxHQUFHLHFCQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7QUFFNUYsNkJBQW9CLGNBQWMsOEhBQUU7Z0JBQTNCLE9BQU87O0FBQ1osbUJBQU8sQ0FBQyxvQkFBb0IsR0FBRyx3QkFBeUIsT0FBTyxDQUFDLENBQUM7U0FDcEU7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxXQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0NBQzlCOztBQUVELElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUU7QUFDcEMsY0FBVSxFQUFFLENBQUM7Q0FDaEIsTUFBTTtBQUNILFlBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDcEU7Ozs7OztBQ2hCRCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1iLElBQU0sZ0JBQWdCLEdBQUc7QUFDckIsYUFBUyxFQUFFLGFBQWE7QUFDeEIsV0FBTyxFQUFFLE1BQU07QUFDZixjQUFVLEVBQUUsU0FBUztBQUNyQixXQUFPLEVBQUU7QUFDTCxXQUFHLEVBQUUsYUFBYTtBQUNsQixZQUFJLEVBQUUsYUFBYTtBQUNu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Qiw4QkFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDOUIsOEJBQU07cUJBQ1Q7O0FBRUQsMEJBQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO2lCQUM5Qjs7QUFFRCxvQkFBSSxDQUFDLE1BQU0sRUFBRTtBQUNULDJCQUFPO2lCQUNWOztBQUVELHNCQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkMsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFVixnQkFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakQsb0JBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7O0FBRWpDLHVCQUFPLE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sS0FBSyxNQUFLLE9BQU8sRUFBRTtBQUM3RCwwQkFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7aUJBQzlCOzs7O0FBSUQsb0JBQUksTUFBTSxLQUFLLE1BQUssT0FBTyxFQUFFO0FBQ3pCLDBCQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUN4QjthQUNKLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDYjs7O1dBL0hnQixvQkFBb0I7OztxQkFBcEIsb0JBQW9COztBQWtJekMsb0JBQW9CLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEdvUmVzdWx0c0hpZ2hsaWdodGVyLCB7IGFzQXJyYXkgfSBmcm9tICcuL3BsdWdpbic7XHJcblxyXG5mdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgY29uc3QgcmVzdWx0RWxlbWVudHMgPSBhc0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tnby1yZXN1bHRzXSxbZGF0YS1nby1yZXN1bHRzXScpKTtcclxuXHJcbiAgICBmb3IgKGxldCB0YWJsZUVsIG9mIHJlc3VsdEVsZW1lbnRzKSB7XHJcbiAgICAgICAgdGFibGVFbC5nb1Jlc3VsdHNIaWdobGlnaHRlciA9IG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZUVsKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6ZWQnKTtcclxufVxyXG5cclxuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgIGluaXRpYWxpemUoKTtcclxufSBlbHNlIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0aWFsaXplLCBmYWxzZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdvUmVzdWx0c0hpZ2hsaWdodGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHNldHRpbmdzIG9mIHRoZSBwbHVnaW5cclxuICogQHR5cGUge29iamVjdH1cclxuICovXHJcbmNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XHJcbiAgICBwcmVmaXhDbHM6ICdnby1yZXN1bHRzLScsXHJcbiAgICBnYW1lQ2xzOiAnZ2FtZScsXHJcbiAgICBjdXJyZW50Q2xzOiAnY3VycmVudCcsXHJcbiAgICByZXN1bHRzOiB7XHJcbiAgICAgICAgd29uOiAnKFswLTldKylcXFxcKycsXHJcbiAgICAgICAgbG9zdDogJyhbMC05XSspXFxcXC0nLFxyXG4gICAgICAgIGppZ286ICcoWzAtOV0rKT0nLFxyXG4gICAgICAgIHVucmVzb2x2ZWQ6ICcoWzAtOV0rKVxcXFw/J1xyXG4gICAgfSxcclxuICAgIHJvd1RhZ3M6ICd0cicsXHJcbiAgICBjZWxsVGFnczogJ3RkLHRoJ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgYXJyYXktbGlrZSBvYmplY3RzIChzdWNoIGFzIGFyZ3VtZW50cyBvciBub2RlIGxpc3RzKSBpbnRvIGFuIGFycmF5XHJcbiAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXHJcbiAqIEByZXR1cm5zIHtBcnJheS48VD59XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXNBcnJheShhcnJheUxpa2UpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuZXcgb2JqZWN0IHdpdGggYXQgdmFsdWVzIGZyb20gZGVmYXVsdE9iaiBhbmQgb2JqLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkZWZhdWx0T2JqXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMob2JqLCBkZWZhdWx0T2JqKSB7XHJcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPYmosIG9iaik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIG1hcCBvZiBwb3NzaWJsZSByZXN1bHRzIGludG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHJlZ2V4cCBzdHJpbmdcclxuICogY29udmVydGVkIGludG8gUmVnRXhwIG9iamVjdHMuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXN1bHRzXHJcbiAqIEByZXR1cm5zIHtBcnJheS48e2Nsczogc3RyaW5nLCByZWdleHA6IFJlZ0V4cH0+fVxyXG4gKi9cclxuZnVuY3Rpb24gbWFwUmVzdWx0c1NldHRpbmdzKHJlc3VsdHMpIHtcclxuICAgIGNvbnN0IG1hcCA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGNscyBpbiByZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMuaGFzT3duUHJvcGVydHkoY2xzKSkge1xyXG4gICAgICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjbHMsXHJcbiAgICAgICAgICAgICAgICByZWdleHA6IG5ldyBSZWdFeHAocmVzdWx0c1tjbHNdKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWFwO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhdmVyc2UgcHJvdmlkZWQgdGFibGUgYW5kIGNyZWF0ZSByZXN1bHRzIG1hcFxyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YWJsZSAtIHRhYmxlIHJlc3VsdHMgY29udGFpbmVyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyAtIHNldHRpbmdzIGZvciBwYXJzZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLnJvd1RhZ3NcclxuICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdzLmNlbGxUYWdzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncy5yZXN1bHRzXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWFwUm93c1RvUGxheWVycyh0YWJsZSwgc2V0dGluZ3MpIHtcclxuICAgIGNvbnN0IHJvd3MgPSBhc0FycmF5KHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2V0dGluZ3Mucm93VGFncykpO1xyXG4gICAgY29uc3QgcmVzdWx0c01hcCA9IG1hcFJlc3VsdHNTZXR0aW5ncyhzZXR0aW5ncy5yZXN1bHRzKTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICBsZXQgbGFzdFBsYWNlO1xyXG5cclxuICAgIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2VsbHMgPSBhc0FycmF5KHJvdy5xdWVyeVNlbGVjdG9yQWxsKHNldHRpbmdzLmNlbGxUYWdzKSk7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBkZWZhdWx0IHBsYWNlXHJcbiAgICAgICAgcm93LmdvUmVzdWx0UGxhY2UgPSAtMTtcclxuXHJcbiAgICAgICAgLy8gbm8gY2VsbHM/IHVubGlrZWx5IHRvIGJlIGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmICghY2VsbHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwbGFjZSA9IHBhcnNlSW50KGNlbGxzWzBdLnRleHRDb250ZW50LCAxMCk7XHJcblxyXG4gICAgICAgIC8vIG1vc3QgcHJvYmFibHkgbm90IGEgcmVzdWx0IHJvd1xyXG4gICAgICAgIGlmIChpc05hTihwbGFjZSkgJiYgIWxhc3RQbGFjZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3N1bXB0aW9uOiBpZiBwbGFjZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCdzIGFuIGV4IGFlcXVvIGNhc2UgYnV0XHJcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzZXQgYSBsb3dlciBwbGFjZSBub25ldGhlbGVzc1xyXG4gICAgICAgIGlmICghcGxhY2UpIHtcclxuICAgICAgICAgICAgcGxhY2UgPSBsYXN0UGxhY2UgPyBsYXN0UGxhY2UgKyAxIDogMTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChwbGFjZSA8PSBsYXN0UGxhY2UpIHtcclxuICAgICAgICAgICAgcGxhY2UgPSBsYXN0UGxhY2UgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGxheWVyID0ge1xyXG4gICAgICAgICAgICBwbGFjZSxcclxuICAgICAgICAgICAgcm93LFxyXG4gICAgICAgICAgICBnYW1lczoge30sXHJcbiAgICAgICAgICAgIG9wcG9uZW50czogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHJlc3VsdCBvZiByZXN1bHRzTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBjZWxsLnRleHRDb250ZW50Lm1hdGNoKHJlc3VsdC5yZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRQbGFjZSA9IG1hdGNoWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNlbGwuZ29PcHBvbmVudFBsYWNlID0gb3Bwb25lbnRQbGFjZTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsczogcmVzdWx0LmNsc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5vcHBvbmVudHMucHVzaChvcHBvbmVudFBsYWNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByb3cuZ29SZXN1bHRQbGFjZSA9IHBsYWNlO1xyXG4gICAgICAgIGxhc3RQbGFjZSA9IHBsYWNlO1xyXG4gICAgICAgIHJlc3VsdHNbcGxhY2VdID0gcGxheWVyO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHM7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdvUmVzdWx0c0hpZ2hsaWdodGVyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgbmV3IGluc3RhbmNlIG9mIEdvUmVzdWx0c0hpZ2hsaWdodGVyXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIG1haW4gZWxlbWVudCBjb250YWluaW5nIHRhYmxlIHdpdGggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5nc10gLSBwbHVnaW4gc2V0dGluZ3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc2V0dGluZ3MucHJlZml4Q2xzPSdnby1yZXN1bHRzLSddIC0gY3NzIGNsYXNzIHByZWZpeFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5nYW1lQ2xzPSdnYW1lJ10gLSBnYW1lIGNlbGwgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jdXJyZW50Q2xzPSdjdXJyZW50J10gLSBzZWxlY3RlZCByb3cgY2xhc3MgbmFtZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtzZXR0aW5ncy5yZXN1bHRzXSAtIG1hcCB3aXRoIHBvc3NpYmxlIHJlc3VsdHMsIGJ5IGRlZmF1bHRcclxuICAgICAqIHN1cHBvcnRzIDQgb3B0aW9ucy4gUHJvdmlkZSB3aXRoIFwiY2xhc3NOYW1lXCIgLT4gXCJyZWdleHBcIiBwYXR0ZXJuLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLndvbj0nKFswLTldKylcXFxcKyddIC0gZGVmYXVsdCB3aW5uaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmxvc3Q9JyhbMC05XSspXFxcXC0nXSAtIGRlZmF1bHQgbG9zaW5nIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLmppZ289JyhbMC05XSspPSddIC0gZGVmYXVsdCBkcmF3IHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yZXN1bHRzLnVucmVzb2x2ZWQ9JyhbMC05XSspXFxcXD9dIC0gZGVmYXVsdCB1bnJlc29sdmVkIHJlZ2V4cFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5yb3dUYWdzPSd0ciddIC0gcXVlcnlTZWxlY3Rpb24tY29tcGF0aWJsZSBzdHJpbmdcclxuICAgICAqIHdpdGggdGFncyByZXByZXNlbnRpbmcgcGxheWVycycgcm93c1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzZXR0aW5ncy5jZWxsVGFncz0ndGQsdGgnXSAtIHF1ZXJ5U2VsZWN0aW9uLWNvbXBhdGlibGVcclxuICAgICAqIHN0cmluZyB3aXRoIHRhZ3MgaG9sZGluZyBnYW1lIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgc2V0dGluZ3MpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBkZWZhdWx0cyhzZXR0aW5ncywgREVGQVVMVF9TRVRUSU5HUyk7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXBSb3dzVG9QbGF5ZXJzKHRoaXMuZWxlbWVudCwgdGhpcy5zZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgdGhlIHJvdyBmb3Igc2VsZWN0ZWQgcGxheWVyIGFuZCBhIGNlbGwgd2l0aCBvcHBvbmVudHMgZ2FtZSBpZlxyXG4gICAgICogcHJvdmlkZWQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3BsYXllclBsYWNlXSAtIHBsYXllcidzIHBsYWNlLCBzZWxlY3Rpb24gd2lsbCBiZSByZW1vdmVcclxuICAgICAqIGlmIG5vdCBwbGF5ZXIgaXMgZm91bmQgZm9yIGdpdmVuIHBsYWNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wcG9uZW50UGxhY2VdIC0gcGxheWVyJ3Mgb3Bwb25lbnQncyBwbGFjZSAtIHRvIG1hcmtcclxuICAgICAqIGNlbGxzIHdpdGggZ2FtZSBiZXR3ZWVuIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgKi9cclxuICAgIHNlbGVjdFBsYXllcihwbGF5ZXJQbGFjZSwgb3Bwb25lbnRQbGFjZSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDbHMgPSB0aGlzLnNldHRpbmdzLnByZWZpeENscyArIHRoaXMuc2V0dGluZ3MuY3VycmVudENscztcclxuICAgICAgICBjb25zdCBnYW1lQ2xzID0gdGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyB0aGlzLnNldHRpbmdzLmdhbWVDbHM7XHJcblxyXG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMubWFwW3BsYXllclBsYWNlXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWFya2VkR2FtZXMgPSBhc0FycmF5KHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuJyArIGdhbWVDbHMpKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRSb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBjdXJyZW50Q2xzKTtcclxuICAgICAgICBjb25zdCBtYXJrZWRQbGF5ZXIgPSBtYXJrZWRSb3cgJiYgbWFya2VkUm93LmdvUmVzdWx0UGxhY2UgPyB0aGlzLm1hcFttYXJrZWRSb3cuZ29SZXN1bHRQbGFjZV0gOiBudWxsO1xyXG5cclxuICAgICAgICAvLyByZW1vdmUgYW55IHZpc2libGUgZ2FtZSBtYXJraW5nc1xyXG4gICAgICAgIGZvciAobGV0IGdhbWVDZWxsIG9mIG1hcmtlZEdhbWVzKSB7XHJcbiAgICAgICAgICAgIGdhbWVDZWxsLmNsYXNzTGlzdC5yZW1vdmUoZ2FtZUNscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1bm1hcmsgcGxheWVyIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgIGlmIChtYXJrZWRQbGF5ZXIgJiYgbWFya2VkUGxheWVyICE9PSBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyay5jYWxsKHRoaXMsIG1hcmtlZFBsYXllciwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbWFyayB0aGUgcGxheWVyIGlmIG5vdCBhbHJlYWR5IG1hcmtlZFxyXG4gICAgICAgIGlmIChwbGF5ZXIgJiYgcGxheWVyICE9PSBtYXJrZWRQbGF5ZXIpIHtcclxuICAgICAgICAgICAgbWFyay5jYWxsKHRoaXMsIHBsYXllciwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYXJrIHRoZSBnYW1lIGJldHdlZW4gdGhlIHBsYXllciBhbmQgdGhlIG9wcG9uZW50XHJcbiAgICAgICAgaWYgKHBsYXllciAmJiBvcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5nYW1lc1tvcHBvbmVudFBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoZ2FtZUNscyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwW29wcG9uZW50UGxhY2VdLmdhbWVzW3BsYXllclBsYWNlXS5jZWxsLmNsYXNzTGlzdC5hZGQoZ2FtZUNscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBtYXJrKHBsYXllciwgYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IGFjdGl2ZSA/ICdhZGQnIDogJ3JlbW92ZSc7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIucm93LmNsYXNzTGlzdFttZXRob2RdKGN1cnJlbnRDbHMpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgb3Bwb25lbnRQbGFjZSBvZiBwbGF5ZXIub3Bwb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnQgPSB0aGlzLm1hcFtvcHBvbmVudFBsYWNlXTtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHBvbmVudC5yb3cuY2xhc3NMaXN0W21ldGhvZF0odGhpcy5zZXR0aW5ncy5wcmVmaXhDbHMgKyBwbGF5ZXIuZ2FtZXNbb3Bwb25lbnRQbGFjZV0uY2xzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmRzIG1vdXNlb3ZlciBhbmQgbW91c2VvdXQgZXZlbnRzIGxpc3RlbmVycyB0byB0aGUgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgYmluZEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIGxldCBvcHBvbmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgLy8gZmV0Y2ggaW5mb3JtYXRpb24gYWJvdXQgaG92ZXJlZCBlbGVtZW50XHJcbiAgICAgICAgICAgIHdoaWxlICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBkb2N1bWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGdhbWUgY2VsbD9cclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuZ29PcHBvbmVudFBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Bwb25lbnQgPSB0YXJnZXQuZ29PcHBvbmVudFBsYWNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHBsYXllciByb3c/IG5vIGZ1cnRoZXIgc2VhcmNoIGlzIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5nb1Jlc3VsdFBsYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyID0gdGFyZ2V0LmdvUmVzdWx0UGxhY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKHBsYXllciwgb3Bwb25lbnQpO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5yZWxhdGVkVGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldCAmJiB0YXJnZXQgIT09IGRvY3VtZW50ICYmIHRhcmdldCAhPT0gdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgbmV3IGhvdmVyZWQgZWxlbWVudCBpcyBvdXRzaWRlIHRoZSB0YWJsZSB0aGVuIHJlbW92ZSBhbGxcclxuICAgICAgICAgICAgLy8gc2VsZWN0aW9uc1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGxheWVyKC0xKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5Hb1Jlc3VsdHNIaWdobGlnaHRlci5ERUZBVUxUX1NFVFRJTkdTID0gREVGQVVMVF9TRVRUSU5HUzsiXX0=
(1)
});
