import { mapRowsToPlayers } from '../src/plugin.js';

function toDomTree(string) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = string;
    return placeholder.firstChild;
}

describe('mapRowsToPlayers', () => {
    describe('should be able to', () => {
        it('handle empty DOM tree', () => {
            expect(mapRowsToPlayers(toDomTree(
                `<table></table>`
            ))).toEqual({});
        });

        it('handle non-empty DOM tree without supported tags', function () {
            expect(mapRowsToPlayers(toDomTree(
                `<table>
                    <thead></thead>
                    <tbody></tbody>
                </table>`
            ))).toEqual({});
        });

        it('handle tables with only places', function () {
            const result = mapRowsToPlayers(toDomTree(
                `<table>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                </table>`
            ));

            expect(result[1]).toBeDefined();
            expect(result[1].place).toBe(1);
            expect(result[1].row instanceof HTMLTableRowElement).toBeTruthy();
            expect(result[1].games).toEqual({});
            expect(result[1].opponents).toEqual([]);

            expect(result[2]).toBeDefined();
            expect(result[2].place).toBe(2);
            expect(result[2].row instanceof HTMLTableRowElement).toBeTruthy();
            expect(result[2].games).toEqual({});
            expect(result[2].opponents).toEqual([]);

            expect(result[1].row).not.toBe(result[2].row);
        });

        it('handle ex aequo places', function () {
            const result = mapRowsToPlayers(toDomTree(
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
            ));

            expect(result[1].place).toBe(1);
            expect(result[2].place).toBe(2);
            expect(result[3].place).toBe(3);
            expect(result[4].place).toBe(3);
            expect(result[5].place).toBe(4);
            expect(result[6].place).toBe(4);
            expect(result[7].place).toBe(4);
            expect(result[8].place).toBe(5);
        });

        it('handle different types of games', function () {
            const result = mapRowsToPlayers(toDomTree(
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
                </table>`
            ));

            expect(result[1].opponents.length).toBe(6);

            expect(result[1].games[2]).toBeDefined();
            expect(result[1].games[2].cls).toBe('won');
            expect(result[1].games[2].cell instanceof HTMLTableCellElement).toBeTruthy();

            expect(result[1].games[3]).toBeDefined();
            expect(result[1].games[3].cls).toBe('won');

            expect(result[1].games[4]).toBeDefined();

            expect(result[1].games[324]).toBeDefined();
            expect(result[1].games[324].cls).toBe('unresolved');

            expect(result[1].games[18]).toBeDefined();
            expect(result[1].games[18].cls).toBe('lost');

            expect(result[1].games[19]).toBeDefined();
            expect(result[1].games[19].cls).toBe('jigo');

            expect(result[1].games['score']).not.toBeDefined();
            expect(result[1].games[10]).not.toBeDefined();

        });

        it('support using different tags', function () {
            const result = mapRowsToPlayers(toDomTree(
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
                </div>`
            ), {
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
            const result = mapRowsToPlayers(toDomTree(
                `<table>
                    <tr><th>ignored!</th></tr>
                    <tr><td>-</td></tr>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>4</td><td>Player 4</td></tr>
                </table>`
            ));

            expect(result[1].place).toBe(1);
            expect(result[2].place).toBe(2);
            expect(result[3].place).toBe(3);
            expect(result[4].place).toBe(4);
        });

        it('look for place in different column', function () {
            const result = mapRowsToPlayers(toDomTree(
                `<table>
                    <tr><td>Player 1</td><td>1</td></tr>
                    <tr><td>Player 2</td><td>2</td></tr>
                    <tr><td>Player 3</td><td>3</td></tr>
                    <tr><td>Player 4</td><td>4</td></tr>
                </table>`
            ), {
                column: 1
            });

            expect(result[1].place).toBe(1);
            expect(result[2].place).toBe(2);
            expect(result[3].place).toBe(3);
            expect(result[4].place).toBe(4);
        });

        it('skip rows based on settings', function () {
            const result = mapRowsToPlayers(toDomTree(
                `<table>
                    <tr><td>1</td><td>Player 1</td></tr>
                    <tr><td>2</td><td>Player 2</td></tr>
                    <tr><td>3</td><td>Player 3</td></tr>
                    <tr><td>4</td><td>Player 4</td></tr>
                </table>`
            ), {
                row: 2
            });

            expect(result[1]).not.toBeDefined();
            expect(result[2]).not.toBeDefined();
            expect(result[3].place).toBe(3);
            expect(result[4].place).toBe(4);
        });
    });
});
