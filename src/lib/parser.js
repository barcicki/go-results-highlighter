'use strict';

import { asArray, defaults } from './utils';
import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toResultsWithRegExp } from './settings';

function writeGridPlacement(row, placement) {
    row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
}

/**
 * Returns array of columns (array of cell values in the column) from given list of rows.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {string} cellSelector
 * @returns {Array.<Array.<string>>}
 */
function getColumnsFromRows(rows, cellSelector) {
    return rows.reduce((columns, row) => {
        asArray(row.querySelectorAll(cellSelector))
            .forEach((cell, index) => {
                let column = columns[index];

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
    return items.filter(cell => resultsMap.some(result => cell.match(result.regexp)));
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
    const count = items.length;
    const itemsWithResultsCount = getItemsWithGoResults(items, resultsMap).length;

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
    return getColumnsFromRows(rows, cellSelector)
        .reduce((indexes, column, index) => {
            if (checkItemsForResults(column, resultsMap)) {
                indexes.push(index);
            }

            return indexes;
        }, []);
}

/**
 * Returns the array of indexes of columns with Go results based on settings.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {*}
 */
function getIndexesOfColumnsWithResults(rows, settings, resultsMap) {
    if (typeof settings.roundsColumns === 'string') {
        return settings.roundsColumns.split(',').map(Number);
    }

    return getIndexesOfColumnsWithResultsFromRows(rows, settings.cellTags, resultsMap);
}

/**
 * Traverses provided table and creates results map.
 *
 * @param {Element|HTMLElement} table - table results container
 * @param {HighlighterSettings} [config] - settings for parser
 * @returns {object}
 */
export default function parse(table, config) {
    const settings = defaults(DEFAULT_SETTINGS, config);
    const rows = asArray(table.querySelectorAll(settings.rowTags));
    const resultsMap = toResultsWithRegExp(settings.results);
    const resultsMapCount = resultsMap.length;
    const columnsWithResults = getIndexesOfColumnsWithResults(rows, settings, resultsMap);
    const results = {};

    function parseGames(player, cells) {
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

                    // opponent row doesn't exist
                    if (opponentPlace <= 0 || (!settings.ignoreOutOfBoundsRows && opponentPlace > rows.length)) {
                        return;
                    }

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
        const cellsWithResults = cells.filter((cell, index) => columnsWithResults.indexOf(index) !== -1);

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

        parseGames(player, cellsWithResults);

        player.tournamentPlace = tournamentPlacement;
        player.opponents.sort((a, b) => a > b ? 1 : -1);

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    return results;
}