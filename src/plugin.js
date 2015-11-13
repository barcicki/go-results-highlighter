'use strict';

import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, readTableSettingsFromDOM } from './settings';
import parse from './parser';
import convert from './raw2table';
import { asArray, defaults } from './utils';

export default class GoResultsHighlighter {

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
    constructor(element, settings) {
        this.settings = defaults(DEFAULT_SETTINGS, readTableSettingsFromDOM(element), settings);

        if (element instanceof HTMLPreElement) {
            let table = convert(element.innerHTML, settings);
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
        this.element.goResultsHighlighter = this;
        this.showingDetails = false;
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
     * Marks the row for selected player and a cell with opponents game if
     * provided.
     * @param {number} [playerPlace] - player's place, selection will be remove
     * if not player is found for given place
     * @param {number} [opponentPlace] - player's opponent's place - to mark
     * cells with game between player and the opponent
     */
    selectPlayer(playerPlace, opponentPlace) {
        const currentCls = this.settings.prefixCls + this.settings.currentCls;
        const gameCls = this.settings.prefixCls + this.settings.gameCls;

        const player = this.map[playerPlace];

        const markedGames = asArray(this.element.querySelectorAll('.' + gameCls));
        const markedRow = this.element.querySelector('.' + currentCls);
        const markedRowPlacement = markedRow ? markedRow.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT) : null;
        const markedPlayer = markedRowPlacement ? this.map[markedRowPlacement] : null;

        // remove any visible game markings
        markedGames.forEach((gameCell) => {
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
            player.opponents.forEach((opponent) => {
                this.map[opponent].games[playerPlace].cell.classList.add(gameCls);
            });

        // mark the game between the player and the opponent
        } else if (player && opponentPlace) {
            player.games[opponentPlace].cell.classList.add(gameCls);
            this.map[opponentPlace].games[playerPlace].cell.classList.add(gameCls);
        }

        function mark(player, active) {
            const method = active ? 'add' : 'remove';

            player.row.classList[method](currentCls);

            player.opponents.forEach((opponentPlace) => {
                let opponent = this.map[opponentPlace];

                opponent.row.classList[method](this.settings.prefixCls + player.games[opponentPlace].cls);
            });
        }
    }

    /**
     * Shows details for selected player
     * @param {number} [playerPlace] - if player with provided place doesn't
     * exist and some other details are shown then the table is reset
     */
    showDetails(playerPlace) {
        const player = this.map[playerPlace];

        if (this.showingDetails) {
            this.players
                .filter((player) => player.row.properNextSibling)
                .reverse()
                .forEach((player) => {
                    if (player.row.properNextSibling === -1) {
                        player.row.parentNode.appendChild(player.row);
                    } else {
                        player.row.parentNode.insertBefore(player.row, player.row.properNextSibling);
                    }
                    player.row.properNextSibling = null;
                });

            this.element.classList.remove(this.settings.prefixCls + this.settings.showingDetailsCls);
        }

        if (!player) {
            this.showingDetails = false;
            return;
        }

        const parent = player.row.parentNode;
        let after = player.row.nextElementSibling;

        player.opponents.forEach((opponentPlace) => {
            let opponent = this.map[opponentPlace];

            opponent.row.properNextSibling = opponent.row.nextElementSibling || -1;

            if (opponentPlace < playerPlace) {
                parent.insertBefore(opponent.row, player.row);
            } else {
                parent.insertBefore(opponent.row, after);
                after = opponent.row.nextElementSibling;
            }
        });

        this.element.classList.add(this.settings.prefixCls + this.settings.showingDetailsCls);
        this.showingDetails = true;
        this.selectPlayer(playerPlace);
    }

    /**
     * Binds mouseover and mouseout events listeners to the element.
     */
    bindEvents() {
        this.element.addEventListener('click', (event) => {
            if (this.settings.clicking === false) {
                return;
            }

            let target = event.target;
            let playerPlacement = null;

            // fetch information about hovered element
            while (target && target !== document) {
                let placement = target.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT);

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

            let lastTargetPos;

            if (!this.showingDetails) {
                this.showDetails(playerPlacement);

            } else if (target.properNextSibling) {
                lastTargetPos = target.getBoundingClientRect().top;

                this.showDetails(playerPlacement);

            } else {
                lastTargetPos = target.getBoundingClientRect().top;

                this.showDetails(-1);
                this.selectPlayer(playerPlacement);
            }

            if (lastTargetPos) {
                let diff = target.getBoundingClientRect().top - lastTargetPos;

                if (Math.abs(diff) > 10) {
                    window.scrollBy(0, diff);
                }
            }
        });

        this.element.addEventListener('mouseover', (event) => {
            if (this.settings.hovering === false || this.showingDetails) {
                return;
            }

            let target = event.target;
            let opponent = null;
            let player = null;

            // fetch information about hovered element
            while (target && target !== document) {
                let opponentGridPlacement = target.getAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT);
                let playerGridPlacement = target.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT);

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

            this.selectPlayer(player, opponent);
        }, false);

        this.element.addEventListener('mouseout', (event) => {
            if (this.settings.hovering === false || this.showingDetails) {
                return;
            }

            let target = event.relatedTarget;

            while (target && target !== document && target !== this.element) {
                target = target.parentNode;
            }

            // if new hovered element is outside the table then remove all
            // selections
            if (target !== this.element) {
                this.selectPlayer(-1);
            }
        }, false);
    }
}

GoResultsHighlighter.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
