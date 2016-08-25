'use strict';

import { asArray, defaults, isNumber, arrayToObject } from './utils';
import { DEFAULT_SETTINGS, DOM_ATTRIBUTES, toResultsWithRegExp, nameHeadersToRegExp, toPrefixedClasses} from './settings';

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
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {function(*, *=): boolean}
 */
function getFilterForColumnsWithResults(rows, settings, resultsMap) {
    if (typeof settings.roundsColumns === 'string') {
        const  indexes = settings.roundsColumns.split(',').map(Number);

        return createCellFromColumnsFilter(indexes);
    }

    // check is disabled - return all columns
    if (!settings.checkColumnsForResults) {
        return () => true;
    }

    const  indexes = getIndexesOfColumnsWithResultsFromRows(rows, settings.cellTags, resultsMap);

    return createCellFromColumnsFilter(indexes);
}

/**
 * Returns the array of indexes of columns that look like keeping player names
 * by searching for certain header names.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithNamesByHeaderNames(rows, settings){
    const regexps = nameHeadersToRegExp(settings.nameColumnHeaders);

    let indexes = [];
    const columns = getColumnsFromRows(rows, settings.headerTags);
    columns.forEach((cells, index) => {
        if (cells.some(cell => regexps.some(rx => cell.match(rx)))) {
            indexes.push(index);
        }
    });

    return indexes;
}

/**
 * Checks if at least threshold level of strings from given set look like player names.
 *
 * @param {Array.<string>} items
 * @param {function(string): boolean} filter
 * @param {number} threshold
 * @returns {boolean}
 */
function checkItems(items, filter, threshold) {
    threshold = threshold || 0.4;
    const count = items.length;
    const itemsWithResultsCount = items.filter(cell => filter(cell)).length;

    return itemsWithResultsCount / count >= threshold;
}

/**
 * Returns the array of indexes of columns that look like keeping player names
 * by inspecting cell values
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {Array.<number>}
 */
function getIndexesOfColumnsWithNamesByCellValues(rows, settings){
    if (!settings.nameCellExpression) {
        return [];
    }

    const regExp = new RegExp(settings.nameCellExpression);

    const nameFilter = cell => cell.match(regExp);
    return getColumnsFromRows(rows, settings.cellTags)
            .reduce((indexes, column, index) => {
                if (checkItems(column, nameFilter)) {
                    indexes.push(index);
                }

                return indexes;
            }, []);
}

/**
 * Returns a filter that allows to select columns containing player name.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {HighlighterSettings} settings
 * @returns {function(*, *=): boolean}
 */
function getFilterForColumnsWithName(rows, settings){
    let indexes = [];
    if (typeof settings.nameColumns === 'string') {
        indexes = settings.nameColumns.split(',').map(Number);

    } else if (isNumber(settings.nameColumns)) {
        indexes.push(parseInt(settings.nameColumns))

    } else if (settings.checkColumnsForPlayerNames) {
        indexes = getIndexesOfColumnsWithNamesByHeaderNames(rows, settings);
        if (!indexes || indexes.length == 0) {
            indexes = getIndexesOfColumnsWithNamesByCellValues(rows, settings);
        }
    }

    return createCellFromColumnsFilter(indexes);
}

/**
 * Sets opponent name hint to cell
 *
 * @param {Element|HTMLElement} cell - table cell with match result
 * @param {string} opponentName
 * @param {string} resultCls - css class for match outcome
 * @param {{}} cssClasses
 * @returns {void}
 */
function setOpponentNameHint(cell, opponentName, resultCls, cssClasses){
    //cell.setAttribute('title', opponentName);
    cell.classList.add(cssClasses.tooltipCointainerCls);
    if (cell.children && !Array.from(cell.children).some(child => child.classList && child.classList.contains(cssClasses.tooltiptextCls))) {
        let div = document.createElement("div");
        div.innerHTML = opponentName;
        div.classList.add(cssClasses.tooltiptextCls, resultCls);
        cell.appendChild(div);
    }
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
    const columnsWithResultsFilter = getFilterForColumnsWithResults(rows, settings, resultsMap);
    const columnsForNameFilter = settings.displayOpponentNameHint ? getFilterForColumnsWithName(rows, settings) : (cell, index) => false;
    const results = [];

    function parseGames(player, cells, players, settings) {
        const displayOpponentNameHint = settings.displayOpponentNameHint;
        const classes = toPrefixedClasses(settings);
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

            if (displayOpponentNameHint){
                const opponentName = players[opponentPlace] ? players[opponentPlace].name : '';
                if (opponentName) {
                    setOpponentNameHint(cell, opponentName, settings.prefixCls + resultCls, classes);
                }
            }
        });
    }

    let lastTournamentPlacement;
    let lastGridPlacement;

    rows.forEach((row, index) => {
        if (index < settings.startingRow) {
            return;
        }

        const cells = asArray(row.querySelectorAll(settings.cellTags));
        const cellsWithName = cells.filter(columnsForNameFilter);
        const name = cellsWithName.map(cell => cell.textContent).join(' ');

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
            opponents: [],
            name
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

        player.tournamentPlace = tournamentPlacement;
        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    results.forEach(player => {
        const cells = asArray(player.row.querySelectorAll(settings.cellTags));
        const cellsWithResults = cells.filter(columnsWithResultsFilter);
        
        parseGames(player, cellsWithResults, results, settings);

        player.opponents.sort((a, b) => a > b ? 1 : -1);
    });


    return arrayToObject(results);
}