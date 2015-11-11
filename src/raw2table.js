'use strict';

import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toResultsWithRegExp } from './settings';
import { defaults } from './utils';

/**
 * Converts raw results string into table with rows and cells.
 * Returns null if not valid input.
 * @param {string} rawResults
 * @param {object} [config]
 * @param {number} [config.startingRow=0] - informs where is the first row with results
 * @param {number} [config.placeColumn=0] - informs in which column is the place located
 * @param {string} [config.roundsColumns] - comma separated list of columns where game results are located
 * @param {string} [config.cellSeparator='[\t ]+'] - separated used to divide rows into cells
 * @param {boolean} [config.joinNames=true] - joins two consecutive cells after the place column into one cell
 * @returns {HTMLElement|null}
 */
export default function convertRawResultsToTable(rawResults, config) {
    if (!rawResults) {
        return null;
    }

    const settings = defaults(DEFAULT_SETTINGS, config);
    const lines = rawResults.split(/\r\n|\n/);

    if (lines.length <= 2 && !lines[0] && !lines[1]) {
        return null;
    }

    const resultsMap = toResultsWithRegExp(settings.results);
    const resultsMapCount = resultsMap.length;
    const output = document.createElement('table');

    const rows = lines
        .map((line) => line

            // probably unhealthy replacing space in rank in order to make sure
            // that it won't be broken into two cells
            .replace(/([0-9]+)\s(dan|kyu)/i, '$1_$2')

            // split line to cells (consider tabs and spaces as separators by default)
            .split(new RegExp(settings.rowSeparator))

            // remove empty cells
            .filter((cell) => cell.length > 0)
        )

        // filter out empty rows or rows starting with ';' (EGD/FFG comment)
        .filter((cells) => cells.length > 0 && cells[0].indexOf(';') !== 0);

    const tableWidth = rows.reduce((prev, line) => Math.max(prev, line.length), 0);
    const tableModifier = settings.joinNames ? -1 : 0;
    const joinNamePos = settings.placeColumn + 1;

    let gamesInColumns = null;

    // if columns rounds are provided then convert only them
    if (typeof settings.roundsColumns === 'string') {
        gamesInColumns = settings.roundsColumns.split(',').map(Number);
    }

    let previousPlace;

    rows.forEach((cells, index) => {
        const row = document.createElement('tr');
        const width = cells.length;

        if (!width) {
            return;
        }

        if (index < settings.startingRow || width < (tableWidth + tableModifier)) {
            let cell = document.createElement('td');

            cell.setAttribute('colspan', tableWidth + tableModifier);
            cell.textContent = cells.join(' ');

            row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, -1);
            row.appendChild(cell);

        } else {

            const place = parseInt(cells[settings.placeColumn], 10);

            if (isNaN(place) && !previousPlace) {
                cells.forEach((cellContent) => {
                    let cell = document.createElement('td');

                    cell.textContent = cellContent;

                    row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, -1);
                    row.appendChild(cell);
                });

            } else {
                row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, previousPlace || place);

                let opponents = [];

                if (settings.joinNames) {
                    cells.splice(joinNamePos, 2, `${cells[joinNamePos]}  ${cells[joinNamePos + 1]}`);
                }

                cells.forEach((cellContent, index) => {
                    let cell = document.createElement('td');

                    cell.textContent = cellContent.replace(/_/, ' ');

                    if (!gamesInColumns || gamesInColumns.indexOf(index) >= 0) {
                        for (let i = 0; i < resultsMapCount; i++) {
                            let match = cellContent.match(resultsMap[i].regexp);

                            if (!match) {
                                continue;
                            }

                            let opponentPlacement = match[1];

                            opponents.push(opponentPlacement);
                            cell.setAttribute(DOM_ATTRIBUTES.OPPONENT_PLACEMENT, opponentPlacement);
                            cell.setAttribute(DOM_ATTRIBUTES.GAME_RESULT, resultsMap[i].cls);
                        }
                    }

                    row.appendChild(cell);
                });

                if (opponents.length) {
                    row.setAttribute(DOM_ATTRIBUTES.OPPONENTS, opponents.join(','));
                }

                if (!previousPlace) {
                    previousPlace = 2;
                }  else {
                    previousPlace += 1;
                }

            }
        }

        output.appendChild(row);
    });

    output.setAttribute(DOM_ATTRIBUTES.RESULT_TABLE, '');

    return output;
}
