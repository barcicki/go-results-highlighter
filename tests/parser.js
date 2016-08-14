'use strict';

import parse from '../src/lib/parser';
import { combine } from '../src/lib/utils';
import { readTableSettingsFromDOM } from '../src/lib/settings';

describe('parser', () => {
    let placeholder;

    beforeAll(() => placeholder = document.createElement('div'));

    function testMap(dom, settings) {
        placeholder.innerHTML = dom;

        const element = placeholder.firstChild;
        const config = combine(readTableSettingsFromDOM(element), settings);

        return parse(element, config);
    }

    describe('should be able to', () => {
        it('handle empty DOM tree', () => {
            expect(testMap(
                `<table></table>`
            )).toEqual({});
        });

        it('handle non-empty DOM tree without supported tags', function () {
            expect(testMap(
                `<table>
                    <thead></thead>
                    <tbody></tbody>
                </table>`
            )).toEqual({});
        });

        it('handle tables with only places', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                </table>`
            );

            expect(result[1]).toBeDefined();
            expect(result[1].tournamentPlace).toBe(1);
            expect(result[1].row instanceof HTMLTableRowElement).toBeTruthy();
            expect(result[1].games).toEqual({});
            expect(result[1].opponents).toEqual([]);

            expect(result[2]).toBeDefined();
            expect(result[2].tournamentPlace).toBe(2);
            expect(result[2].row instanceof HTMLTableRowElement).toBeTruthy();
            expect(result[2].games).toEqual({});
            expect(result[2].opponents).toEqual([]);

            expect(result[1].row).not.toBe(result[2].row);
        });

        it('read places from DOM', function () {
            const result = testMap(
                `<table>
                    <tr data-go-place="2"><td>1</td><td>Player 1</td></tr>
                    <tr data-go-place="5"><td>2</td><td>Player 2</td></tr>
                </table>`
            );

            expect(result[2]).toBeDefined();
            expect(result[2].tournamentPlace).toBe(1);

            expect(result[5]).toBeDefined();
            expect(result[5].tournamentPlace).toBe(2);
        });

        it('handle ex aequo places', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>3</td><td>Player 4</td></tr>
                    <tr><td>4</td><td>Player 5</td></tr>
                    <tr><td>-</td><td>Player 6</td></tr>
                    <tr><td>-</td><td>Player 7</td></tr>
                    <tr><td>5</td><td>Player 8</td></tr>
                </table>`
            );

            expect(result[1].tournamentPlace).toBe(1);
            expect(result[2].tournamentPlace).toBe(2);
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(3);
            expect(result[5].tournamentPlace).toBe(4);
            expect(result[6].tournamentPlace).toBe(4);
            expect(result[7].tournamentPlace).toBe(4);
            expect(result[8].tournamentPlace).toBe(5);
        });

        it('handle different types of games', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td><td>2+</td><td>3=</td><td>PL</td><td>10</td></tr>
                    <tr><td>2</td><td>Player 2</td><td>1-</td><td>4?</td><td>PL</td><td>10</td></tr>
                    <tr><td>3</td><td>Player 3</td><td>3+</td><td>1=</td><td>PL</td><td>10</td></tr>
                    <tr><td>4</td><td>Player 4</td><td>4-</td><td>2?</td><td>PL</td><td>10</td></tr>
                </table>`
            );

            const player1 = result[1];
            const player2 = result[2];

            expect(player1.opponents.length).toBe(2);
            expect(player2.opponents.length).toBe(2);

            expect(player1.games[2]).toBeDefined();
            expect(player1.games[2].cls).toBe('won');
            expect(player1.games[2].cell instanceof HTMLTableCellElement).toBeTruthy();

            expect(player1.games[3]).toBeDefined();
            expect(player1.games[3].cls).toBe('jigo');

            expect(player2.games[1]).toBeDefined();
            expect(player2.games[1].cls).toBe('lost');

            expect(player2.games[4]).toBeDefined();
            expect(player2.games[4].cls).toBe('unresolved');

            expect(player1.games['PL']).not.toBeDefined();
            expect(player1.games[10]).not.toBeDefined();
        });

        it('disallow games with non-existing players', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td><td>2+</td><td>0+</td><td>PL</td><td>10</td></tr>
                    <tr><td>2</td><td>Player 2</td><td>1-</td><td>123?</td><td>PL</td><td>10</td></tr>
                </table>`
            );

            const player1 = result[1];
            const player2 = result[2];

            expect(player1.opponents.length).toBe(1);
            expect(player2.opponents.length).toBe(1);

            expect(player1.games[0]).not.toBeDefined();
            expect(player2.games[123]).not.toBeDefined();
        });

        it('allow games with non-existing players when proper flag is set (0 is never allowed)', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td><td>2+</td><td>0+</td><td>PL</td><td>10</td></tr>
                    <tr><td>2</td><td>Player 2</td><td>1-</td><td>123?</td><td>PL</td><td>10</td></tr>
                </table>`, {
                    ignoreOutOfBoundsRows: true
                });

            const player1 = result[1];
            const player2 = result[2];

            expect(player1.opponents.length).toBe(1);
            expect(player2.opponents.length).toBe(2);

            expect(player1.games[0]).not.toBeDefined();
            expect(player2.games[123]).toBeDefined();
        });

        it('handle selected game columns', function () {
            const result = testMap(
                `<table>
                    <tr>
                        <td>1</td>
                        <td>Player 1</td>
                        <td>2+</td>
                        <td>3+</td>
                        <td>4+</td>
                        <td>324?</td>
                        <td>18-</td>
                        <td>19=</td>
                        <td>score</td>
                        <td>10</td>
                    </tr>
                </table>`, {
                    roundsColumns: '2, 3, 4, 6',
                    ignoreOutOfBoundsRows: true
                });

            const player = result[1];

            expect(player.opponents.length).toBe(4);
            expect(player.games[2]).toBeDefined();
            expect(player.games[3]).toBeDefined();
            expect(player.games[4]).toBeDefined();
            expect(player.games[18]).toBeDefined();
            expect(player.games[324]).not.toBeDefined();
            expect(player.games[19]).not.toBeDefined();
        });

        it('read results from attributes', function () {
            const result = testMap(
                `<table>
                    <tr>
                        <td>1</td>
                        <td>Player 1</td>
                        <td data-go-opponent="3" data-go-result="won">2+</td>
                        <td data-go-opponent="5" data-go-result="lost">3+</td>
                        <td data-go-opponent="8" data-go-result="jigo">4+</td>
                        <td data-go-opponent="13" data-go-result="unresolved">18-</td>
                        <td>score</td>
                        <td>10</td>
                    </tr>
                </table>`);

            const player = result[1];

            expect(player.opponents.length).toBe(4);
            expect(player.games[2]).not.toBeDefined();
            expect(player.games[4]).not.toBeDefined();
            expect(player.games[18]).not.toBeDefined();
            expect(player.games[3]).toBeDefined();
            expect(player.games[3].cls).toBe('won');
            expect(player.games[5]).toBeDefined();
            expect(player.games[5].cls).toBe('lost');
            expect(player.games[8]).toBeDefined();
            expect(player.games[8].cls).toBe('jigo');
            expect(player.games[13]).toBeDefined();
            expect(player.games[13].cls).toBe('unresolved');
        });

        it('support using different tags', function () {
            const result = testMap(
                `<div>
                    <div class="row">
                        <div class="place">1</div>
                        <div class="name">Player 1</div>
                        <div class="game">2+</div>
                    </div>
                    <div class="row">
                        <div class="place">2</div>
                        <div class="name">Player 2</div>
                        <div class="game">1-</div>
                    </div>
                </div>`, {
                    rowTags: '.row',
                    cellTags: '.place, .game'
                });

            expect(result[1].games[2]).toBeDefined();
            expect(result[1].games[2].cls).toBe('won');
            expect(result[1].games[2].cell instanceof HTMLDivElement).toBeTruthy();

            expect(result[2].games[1]).toBeDefined();
            expect(result[2].games[1].cls).toBe('lost');
            expect(result[2].games[1].cell instanceof HTMLDivElement).toBeTruthy();
        });

        it('skip preceding rows without place in the first column', function () {
            const result = testMap(
                `<table>
                    <tr><th>ignored!</th></tr>
                    <tr><td>-</td></tr>
                    <tr></tr>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>4</td><td>Player 4</td></tr>
                </table>`
            );

            expect(result[1].tournamentPlace).toBe(1);
            expect(result[2].tournamentPlace).toBe(2);
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(4);
        });

        it('look for place in different column', function () {
            const result = testMap(
                `<table>
                    <tr><td>Player 1</td><td>1</td></tr>
                    <tr><td>Player 2</td><td>2</td></tr>
                    <tr><td>Player 3</td><td>3</td></tr>
                    <tr><td>Player 4</td><td>4</td></tr>
                </table>`, {
                    placeColumn: 1
                });

            expect(result[1].tournamentPlace).toBe(1);
            expect(result[2].tournamentPlace).toBe(2);
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(4);
        });

        it('skip rows based on settings', function () {
            const result = testMap(
                `<table>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>4</td><td>Player 4</td></tr>
                </table>`, {
                    startingRow: 2
                });

            expect(result[1]).not.toBeDefined();
            expect(result[2]).not.toBeDefined();
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(4);
        });

        it('take column and row settings from the DOM', function () {
            const result = testMap(
                `<table data-go-place-column="1" data-go-starting-row="2">
                    <tr><td>Player 1</td><td>1</td></tr>
                    <tr><td>Player 2</td><td>2</td></tr>
                    <tr><td>Player 3</td><td>3</td></tr>
                    <tr><td>Player 4</td><td>4</td></tr>
                </table>`
            );

            expect(result[1]).not.toBeDefined();
            expect(result[2]).not.toBeDefined();
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(4);
        });

        it('take column and row settings from the DOM, but let override them', function () {
            const result = testMap(
                `<table data-go-place-col="1" data-go-starting-row="2">
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>4</td><td>Player 4</td></tr>
                </table>`, {
                    startingRow: 0,
                    placeColumn: 0
                });

            expect(result[1].tournamentPlace).toBe(1);
            expect(result[2].tournamentPlace).toBe(2);
            expect(result[3].tournamentPlace).toBe(3);
            expect(result[4].tournamentPlace).toBe(4);
        });
    });
});
