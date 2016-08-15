'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parse;

var _utils = require('./utils');

var _settings = require('./settings');

function writeGridPlacement(row, placement) {
    row.setAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT, placement);
}

/**
 * Returns array of columns (array of cell values in the column) from given list of rows.
 *
 * @param {Array.<Element|HTMLElement>} rows
 * @param {string} cellSelector
 * @returns {Array.<Array.<string>>}
 */
function getColumnsFromRows(rows, cellSelector) {
    return rows.reduce(function (columns, row) {
        (0, _utils.asArray)(row.querySelectorAll(cellSelector)).forEach(function (cell, index) {
            var column = columns[index];

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
    return items.filter(function (cell) {
        return resultsMap.some(function (result) {
            return cell.match(result.regexp);
        });
    });
}

/**
 * Checks if at least 80% of strings from given set look like Go results.
 *
 * @param {Array.<string>} items
 * @param {Array.<ResultMapping>} resultsMap
 * @returns {boolean}
 */
function checkItemsForResults(items, resultsMap) {
    var count = items.length;
    var itemsWithResultsCount = getItemsWithGoResults(items, resultsMap).length;

    return itemsWithResultsCount / count >= 0.8;
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
    return getColumnsFromRows(rows, cellSelector).reduce(function (indexes, column, index) {
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
 * Traverse provided table and create results map
 * @param {HTMLElement} table - table results container
 * @param {HighlighterSettings} [config] - settings for parser
 * @returns {object}
 */
function parse(table, config) {
    var settings = (0, _utils.defaults)(_settings.DEFAULT_SETTINGS, config);
    var rows = (0, _utils.asArray)(table.querySelectorAll(settings.rowTags));
    var resultsMap = (0, _settings.toResultsWithRegExp)(settings.results);
    var resultsMapCount = resultsMap.length;
    var columnsWithResults = getIndexesOfColumnsWithResults(rows, settings, resultsMap);
    var results = {};

    function parseGames(player, cells) {
        cells.forEach(function (cell) {
            var opponentPlace = void 0;
            var resultCls = void 0;

            if (cell.hasAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT) && cell.hasAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT)) {
                opponentPlace = Number(cell.getAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT));
                resultCls = cell.getAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT);
            } else {
                for (var i = 0; i < resultsMapCount; i++) {
                    var match = cell.textContent.match(resultsMap[i].regexp);

                    if (!match) {
                        continue;
                    }

                    opponentPlace = Number(match[1]);
                    resultCls = resultsMap[i].cls;

                    // opponent row doesn't exist
                    if (opponentPlace <= 0 || !settings.ignoreOutOfBoundsRows && opponentPlace > rows.length) {
                        return;
                    }

                    cell.setAttribute(_settings.DOM_ATTRIBUTES.OPPONENT_PLACEMENT, opponentPlace);
                    cell.setAttribute(_settings.DOM_ATTRIBUTES.GAME_RESULT, resultsMap[i].cls);
                }

                if (!opponentPlace) {
                    return;
                }
            }

            player.games[opponentPlace] = {
                cell: cell,
                cls: resultCls
            };

            player.opponents.push(opponentPlace);
        });
    }

    var lastTournamentPlacement = void 0;
    var lastGridPlacement = void 0;

    rows.forEach(function (row, index) {
        if (index < settings.startingRow) {
            return;
        }

        var cells = (0, _utils.asArray)(row.querySelectorAll(settings.cellTags));
        var cellsWithResults = cells.filter(function (cell, index) {
            return columnsWithResults.indexOf(index) !== -1;
        });

        // assign default place
        var gridPlacement = -1;

        // no cells? unlikely to be a result row
        if (!cells.length || !cells[settings.placeColumn]) {
            writeGridPlacement(row, gridPlacement);
            return;
        }

        var tournamentPlacement = parseInt(cells[settings.placeColumn].textContent, 10);

        var player = {
            tournamentPlace: -1,
            row: row,
            games: {},
            opponents: []
        };

        if (row.hasAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT)) {
            gridPlacement = Number(row.getAttribute(_settings.DOM_ATTRIBUTES.PLAYER_PLACEMENT));
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
        player.opponents.sort(function (a, b) {
            return a > b ? 1 : -1;
        });

        results[gridPlacement] = player;

        lastTournamentPlacement = tournamentPlacement;
        lastGridPlacement = gridPlacement;
    });

    return results;
}