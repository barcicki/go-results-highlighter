import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toPrefixedClasses, readTableSettingsFromDOM } from './settings';
import parse from './parser';
import convert from './raw2table';
import { asArray, defaults } from './utils';

export default class GoResultsHighlighter {

    /**
     * Creates new instance of GoResultsHighlighter
     *
     * @param {HTMLElement|Node} element - main element containing table with results
     * @param {HighlighterSettings} [settings] - plugin settings
     */
    constructor(element, settings) {
        this.settings = defaults(DEFAULT_SETTINGS, readTableSettingsFromDOM(element), settings);

        if (element instanceof HTMLPreElement || element instanceof Text) {
            let table = convert(element.textContent, settings);
            let parent = element.parentNode;

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
        this.element.setAttribute(DOM_ATTRIBUTES.RESULT_TABLE, '');

        this.current = null;
        this.games = [];
        this.isRearranged = false;
        this.isHighlighting = false;
    }

    /**
     * Creates players map
     */
    createPlayersMap() {
        this.map = parse(this.element, this.settings);
        this.players = [];

        for (let placement in this.map) {
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
    highlight(settings) {
        if (!settings) {
            settings = {};
        }

        let playerPlace = settings.player;
        let rearrange = settings.rearrange === true;
        let gamesToHighlight = settings.games;

        const player = this.map[playerPlace];
        const classes = toPrefixedClasses(this.settings);

        // if table is already rearranged then transform it back to default state
        if (this.isRearranged) {
            restoreNaturalOrder(this.players);
        }

        // rearrange the table if player and appropriate setting is provided
        if (player && rearrange) {
            rearrangeOrder(player, player.opponents.map((opponentPlace) => this.map[opponentPlace]));

            this.element.classList.add(classes.rearrangedCls);
            this.isRearranged = true;
        } else {
            this.element.classList.remove(classes.rearrangedCls);
            this.isRearranged = false;
        }

        const markedGames = asArray(this.element.querySelectorAll('.' + classes.gameCls));
        const markedRow = this.element.querySelector('.' + classes.currentCls);
        const markedRowPlacement = markedRow ? markedRow.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT) : null;
        const markedPlayer = markedRowPlacement ? this.map[markedRowPlacement] : null;
        const mark = (player, active) => {
            const method = active ? 'add' : 'remove';

            player.row.classList[method](classes.currentCls);

            player.opponents.forEach((opponentPlace) => {
                const opponent = this.map[opponentPlace];

                if (opponent) {
                    opponent.row.classList[method](this.settings.prefixCls + player.games[opponentPlace].cls);
                }
            });
        };

        // remove any visible game markings
        markedGames.forEach((gameCell) => {
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
                gamesToHighlight.forEach((opponentPlace) => {
                    let opponent = this.map[opponentPlace];
                    let game = player.games[opponentPlace];

                    if (opponent && game) {
                        game.cell.classList.add(classes.gameCls);
                        opponent.games[playerPlace].cell.classList.add(classes.gameCls);
                        this.games.push(opponentPlace);
                    }
                });
            } else if (this.isRearranged) {
                player.opponents.forEach((opponent) => {
                    this.map[opponent].games[playerPlace].cell.classList.add(classes.gameCls);
                    this.games.push(opponent);
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
    configure(settings) {

        // remove any highlighting
        this.highlight(null);

        // remove class name added to the table
        this.element.classList.remove(this.settings.prefixCls + this.settings.tableCls);

        // update settings
        this.settings = defaults(this.settings, settings);

        // create new player map (parse rows)
        this.createPlayersMap();

        // add new class name to the table
        this.element.classList.add(this.settings.prefixCls + this.settings.tableCls);
    }

    /**
     * Binds touchend, click, mouseover and mouseout events listeners to the element.
     */
    bindEvents() {
        let hasTouchMoved = false;

        this.element.addEventListener('touchstart', () => {
            hasTouchMoved = false;
        });

        this.element.addEventListener('touchmove', () => {
            hasTouchMoved = true;
        });

        this.element.addEventListener('touchend', (event) => {
            if (hasTouchMoved || (this.settings.rearranging === false && this.settings.hovering === false)) {
                return;
            }

            let { target, player, games } = fetchInformationAboutTarget(event.target, this.element);

            if (!player) {
                return;
            }

            let rearrange = false;
            let lastTargetPos;

            if (this.current === player) {
                if (!this.settings.rearranging || !this.settings.hovering) {
                    player = null;
                }
                rearrange = !this.isRearranged;

            } else if (this.isRearranged || !this.settings.hovering) {
                rearrange = true;
            }

            if (rearrange) {
                lastTargetPos = target.getBoundingClientRect().top;
            }

            this.highlight({ player, games, rearrange });

            if (lastTargetPos) {
                updateTopPosition(target, lastTargetPos);
            }

            event.preventDefault();
        });

        this.element.addEventListener('click', (event) => {
            if (this.settings.rearranging === false) {
                return;
            }

            let { target, player, games } = fetchInformationAboutTarget(event.target, this.element);
            let rearrange = false;
            let lastTargetPos;

            if (!player) {
                return;
            }

            if (!this.isRearranged || (this.map[player] && this.map[player].rearranged)) {
                rearrange = true;

            } else if (!this.settings.hovering) {
                player = null;
            }

            lastTargetPos = target.getBoundingClientRect().top;

            this.highlight({ player, games, rearrange });

            if (lastTargetPos) {
                updateTopPosition(target, lastTargetPos);
            }
        });

        this.element.addEventListener('mouseover', (event) => {
            if (this.settings.hovering === false) {
                return;
            }

            let { player, games } = fetchInformationAboutTarget(event.target, this.element);
            let rearrange = this.isRearranged;

            if (!player) {
                return;
            }

            if (this.isRearranged) {
                if ((!games || player !== this.current) && this.games.length === this.map[this.current].opponents.length) {
                    return;
                }

                if (player !== this.current) {
                    player = this.current;
                    games = null;
                }
            }

            this.highlight({ player, rearrange, games });
        }, false);

        this.element.addEventListener('mouseout', (event) => {
            if (this.settings.hovering === false) {
                return;
            }

            let target = event.relatedTarget;

            while (target && target !== document && target !== this.element) {
                target = target.parentNode;
            }

            // if new hovered element is outside the table then remove all
            // selections unless the table is rearranged - then only highlight
            // all games
            if (target !== this.element) {
                if (this.isRearranged && this.games.length !== this.map[this.current].opponents.length) {
                    this.highlight({ player: this.current, rearrange: true });
                } else if (!this.isRearranged) {
                    this.highlight(null);
                }
            }
        }, false);
    }

    /**
     * Removes inline styles from player rows and their children.
     */
    clearInlineStyles() {
        this.players.forEach(player => {
            // player.row.removeAttribute('style');
            asArray(player.row.childNodes)
              .filter(node => node.nodeType === Node.ELEMENT_NODE)
              .forEach(child => child.removeAttribute('style'));
        });
    };
}

/**
 * Compare current target's top position with previous value and scroll window
 * to previous value if it differs
 * @param {HTMLElement|Node} target
 * @param {number} previousTop
 */
function updateTopPosition(target, previousTop) {
    let diff = target.getBoundingClientRect().top - previousTop;

    if (Math.abs(diff) > 10) {
        window.scrollBy(0, diff);
    }
}

/**
 * Retrieves information about player and opponent placement from provided element
 * or its parents. Returns also the row with player placement information.
 * @param {HTMLElement|Node} target - target of the event
 * @param {HTMLElement} stopNode - stopNode
 * @returns {object}
 */
function fetchInformationAboutTarget(target, stopNode) {
    var result = {
        player: null,
        games: null,
        target: null
    };

    // fetch information about hovered element
    while (target && target !== document && target !== stopNode) {
        let opponentGridPlacement = target.getAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT);
        let playerGridPlacement = target.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT);

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
    players.forEach((player) => {
        const nodeAtIndex = player.row.parentNode.children[player.index];

        if (nodeAtIndex !== player.row) {
            player.row.parentNode.insertBefore(player.row, nodeAtIndex);
        }

        player.rearranged = false;
    });
}

/**
 * Rearranges the rows in a table
 * @param {object} player - player mapping data
 * @param {Array.<object>} opponents - list of opponents mapping data
 */
function rearrangeOrder(player, opponents) {
    const parent = player.row.parentNode;
    let after = player.row.nextElementSibling;

    for (let i = 0; i < opponents.length; i++) {
        const opponent = opponents[i];

        if (opponent.index < player.index) {
            parent.insertBefore(opponent.row, player.row);
        } else {
            parent.insertBefore(opponent.row, after);
            after = opponent.row.nextElementSibling;
        }

        opponent.rearranged = true;
    }
}

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
