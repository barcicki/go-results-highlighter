'use strict';

import { asArray, defaults } from './utils';
import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toResultsWithRegExp } from './settings';

function writeGridPlacement(row, placement) {
    row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
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
export function parse(table, config) {
    const settings = defaults(DEFAULT_SETTINGS, config);
    const rows = asArray(table.querySelectorAll(settings.rowTags));
    const resultsMap = toResultsWithRegExp(settings.results);
    const resultsMapCount = resultsMap.length;
    const results = {};

    function parseGames(player, cells) {
        // if columns rounds are provided then parse only them
        if (typeof settings.roundsColumns === 'string') {
            cells = settings.roundsColumns
                .split(',')
                .map((round) => {
                    return cells[Number(round)];
                });
        }

        cells.forEach((cell) => {
            let opponentPlace;
            let resultCls;


            if (cell.hasAttribute(DOM_ATTRIBUTES.GAME_RESULT) && cell.hasAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT)) {
                opponentPlace = Number(cell.getAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT));
                resultCls = cell.getAttribute(DOM_ATTRIBUTES.GAME_RESULT);

            } else {
                for (let i = 0; i < resultsMapCount; i++) {
                    let match = cell.textContent.match(resultsMap[i].regexp);

                    if (!match) {
                        continue;
                    }

                    opponentPlace = Number(match[1]);
                    resultCls = resultsMap[i].cls;

                    cell.setAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT, opponentPlace);
                    cell.setAttribute(DOM_ATTRIBUTES.GAME_RESULT, resultsMap[i].cls);
                }

                if (!opponentPlace) {
                    return;
                }
            }

            player.games[opponentPlace] = {
                cell,
                cls: resultCls
            };

            player.opponents.push(opponentPlace);
        });
    }

    let lastTournamentPlacement;
    let lastGridPlacement;

    rows.forEach((row, index) => {
        if (index < settings.startingRow) {
            return;
        }

        const cells = asArray(row.querySelectorAll(settings.cellTags));

        // assign default place
        let gridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.placeColumn]) {
            writeGridPlacement(row, gridPlacement);
            return;
        }

        let tournamentPlacement = parseInt(cells[settings.placeColumn].textContent, 10);

        const player = {
            tournamentPlace: -1,
            row,
            games: {},
            opponents: []
        };

        if (row.hasAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT)) {
            gridPlacement = Number(row.getAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT));

        } else {

            // if no player has been mapped
            if (!lastGridPlacement) {

                // most probably not a result row
                if (isNaN(tournamentPlacement)) {
                    return writeGridPlacement(row, gridPlacement);
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

        parseGames(player, cells);

        player.tournamentPlace = tournamentPlacement;
        player.opponents.sort((a, b) => a > b ? 1 : -1);

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    return results;
}