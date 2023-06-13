import { asArray, defaults } from './utils';
import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toResultsWithRegExp } from './settings';

// threshold which when met, can indicate that we successfully identified certain feature
// (e.g. whether given column has go results)
const DETECT_THRESHOLD = 0.4;

function writeGridPlacement(row, placement) {
    row.setAttribute(DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
}

/**
 * Returns array of columns (array of cell values in the column) from given list of rows.
 *
 * @param {Array.<CachedRow>} cachedTable
 * @returns {Array.<Array.<string>>}
 */
function getColumnsFromRows(cachedTable) {
    const columns = [];

    for (let i = 0; i < cachedTable.length; i++) {
        for (let j = 0; j < cachedTable[i].cells.length; j++) {
            if (!columns[j]) {
                columns[j] = [];
            }

            columns[j][i] = cachedTable[i].cells[j].textContent;
        }
    }

    return columns;
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

    return itemsWithResultsCount / count >= DETECT_THRESHOLD;
}

/**
 * Checks if given string is a positive number.
 *
 * @param {string} item
 * @returns {boolean}
 */
function isPositiveNumber(item) {
    const val = Number(item);

    return !isNaN(val) && val > 0;
}

/**
 * Returns the array of indexes of columns that look like keeping Go results.
 *
 * @param {Array.<CachedRow>} cachedTable
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithResultsFromRows(cachedTable, resultsMap) {
    return getColumnsFromRows(cachedTable)
        .reduce((indexes, column, index) => {
            if (checkItemsForResults(column, resultsMap)) {
                indexes.push(index);
            }

            return indexes;
        }, []);
}

/**
 * Creates filter function which returns items from provided list of indexes.
 *
 * @param {Array.<number>} columnsIndexes
 * @returns {function(*, *=): boolean}
 */
function createCellFromColumnsFilter(columnsIndexes) {
    return (cell, index) => columnsIndexes.indexOf(index) !== -1;
}

/**
 * Returns the array of indexes of columns with Go results based on settings.
 *
 * @param {Array.<CachedRow>} cachedTable
 * @param {HighlighterSettings} settings
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {function(*, *=): boolean}
 */
function getFilterForColumnsWithResults(cachedTable, settings, resultsMap) {
    if (typeof settings.roundsColumns === 'string') {
        const  indexes = settings.roundsColumns.split(',').map(Number);

        return createCellFromColumnsFilter(indexes);
    }

    // check is disabled - return all columns
    if (!settings.checkColumnsForResults) {
        return () => true;
    }

    const  indexes = getIndexesOfColumnsWithResultsFromRows(cachedTable, resultsMap);

    return createCellFromColumnsFilter(indexes);
}

/**
 * Returns index of column with places
 *
 * @param {CachedRow[]} cachedTable
 * @param {HighlighterSettings} settings
 * @return {number}
 */
function getPlaceColumn(cachedTable, settings) {
    if (typeof settings.placeColumn === 'number') {
        return settings.placeColumn;
    }

    const columns = getColumnsFromRows(cachedTable);
    const index = columns.findIndex((column) => {
        const count = column.length;
        const numbers = column.filter(isPositiveNumber).length;

        return (numbers / count) >= DETECT_THRESHOLD;
    });

    return Math.max(index, 0);
}

/**
 * Creates cached table
 * @param {HTMLElement} table
 * @param {HighlighterSettings} settings
 * @returns {Array.<CachedRow>}
 */
function cacheTable(table, settings) {
    const rows = table.querySelectorAll(settings.rowTags);
    const result = new Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll(settings.cellTags);

        result[i] = {
            row,
            cells: asArray(cells)
        };
    }

    return result;
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
    const resultsMap = toResultsWithRegExp(settings.results);
    const resultsMapCount = resultsMap.length;

    const cachedTable = cacheTable(table, settings);
    const columnsWithResultsFilter = getFilterForColumnsWithResults(cachedTable, settings, resultsMap);
    const placeColumn = getPlaceColumn(cachedTable, settings);

    const results = {};
    let lastTournamentPlacement;
    let lastGridPlacement;

    cachedTable.forEach(parseRow);

    return results;

    function parseRow({ row, cells }, index) {
        if (index < settings.startingRow) {
            return;
        }

        // assign default place
        let gridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[placeColumn]) {
            writeGridPlacement(row, gridPlacement);
            return;
        }

        let tournamentPlacement = parseInt(cells[placeColumn].textContent, 10);

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

        if (Number(gridPlacement) === -1) {
            return;
        }

        cells.forEach((cell, index) => {
             if (columnsWithResultsFilter(cell, index)) {
                 parseGame(player, cell);
             }
        });

        player.tournamentPlace = tournamentPlacement;
        player.index = index;
        player.opponents.sort((a, b) => a > b ? 1 : -1);

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    }

    function parseGame(player, cell) {
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
                if (opponentPlace <= 0 || (!settings.ignoreOutOfBoundsRows && opponentPlace > cachedTable.length)) {
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
    }
}

/**
 * @typedef {object} CachedRow
 * @property {HTMLElement} row - reference to row node
 * @property {Array.<HTMLElement>} cells - list of references to cell nodes
 */
