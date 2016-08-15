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