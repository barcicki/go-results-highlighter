'use strict';

import GoResultsHighlighter from '../src/lib/wrapper';

const EXAMPLE_TOURNAMENT =
    `<table>
        <tbody>
            <tr><td colspan="11">Example Tournament - After Round 3</td></tr>
            <tr><td>Place</td><td>Name</td><td>Club</td><td>Level</td><td>Score</td><td>1</td><td>2</td><td>3</td><td>Points</td><td>SOS</td><td>SOSOS</td></tr>
            <tr><td>1</td><td>Player 8</td><td>AAA</td><td>2 Kyu</td><td>28</td><td>6+</td><td>5+</td><td>2+</td><td>3</td><td>79</td><td>241</td></tr>
            <tr><td>2</td><td>Player 4</td><td>BBB</td><td>4 Kyu</td><td>27</td><td>8+</td><td>3+</td><td>1-</td><td>2</td><td>80</td><td>238</td></tr>
            <tr><td>3</td><td>Player 6</td><td>BBB</td><td>3 Kyu</td><td>27</td><td>4+</td><td>2-</td><td>7+</td><td>2</td><td>80</td><td>237</td></tr>
            <tr><td>4</td><td>Player 2</td><td>CCC</td><td>3 Kyu</td><td>27</td><td>3-</td><td>6+</td><td>5+</td><td>2</td><td>79</td><td>241</td></tr>
            <tr><td>5</td><td>Player 3</td><td>CCC</td><td>5 Kyu</td><td>26</td><td>7+</td><td>1-</td><td>4-</td><td>1</td><td>81</td><td>236</td></tr>
            <tr><td>6</td><td>Player 7</td><td>AAA</td><td>5 Kyu</td><td>26</td><td>1-</td><td>4-</td><td>8+</td><td>1</td><td>80</td><td>237</td></tr>
            <tr><td>7</td><td>Player 1</td><td>AAA</td><td>6 Kyu</td><td>26</td><td>5-</td><td>8+</td><td>3-</td><td>1</td><td>78</td><td>240</td></tr>
            <tr><td>8</td><td>Player 5</td><td>BBB</td><td>8 Kyu</td><td>25</td><td>2-</td><td>7-</td><td>6-</td><td>0</td><td>79</td><td>238</td></tr>
        </tbody>
    </table>`;

describe('GoResultsHighlighter', () => {
    let placeholder;

    beforeAll(() => placeholder = document.createElement('div'));

    function createDom(dom) {
        placeholder.innerHTML = dom;
        return placeholder.firstChild;
    }

    describe('should be able to', () => {

        it('bind to table element and be accessible by element property', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.element).toBe(table);
            expect(table.goResultsHighlighter).toBe(highlighter);
        });

        it('bind to pre element with replacing it with table', () => {
            let pre = createDom('<pre></pre>');
            let highlighter = new GoResultsHighlighter(pre);

            expect(highlighter.element).not.toBe(pre);
            expect(pre.goResultsHighlighter).not.toBeDefined();
        });

        it('return highlighter instance when called without new', () => {
            let table = createDom('<table></table>');
            let highlighter = GoResultsHighlighter(table);

            expect(highlighter instanceof GoResultsHighlighter).toBe(true);
        });

        it('start with initial configuration', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.players).toBe(0);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);
            expect(highlighter.hovering).toBe(true);
            expect(highlighter.rearranging).toBe(true);
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.configuration).toEqual({
                prefixCls: 'go-results-',
                rearrangedCls: 'rearranged',
                tableCls: 'table',
                gameCls: 'game',
                currentCls: 'current',

                results: {
                    won: '([0-9]+)\\+',
                    lost: '([0-9]+)\\-',
                    jigo: '([0-9]+)=',
                    unresolved: '([0-9]+)\\?'
                },

                startingRow: 0,
                placeColumn: null,
                roundsColumns: null,
                ignoreOutOfBoundsRows: false,
                checkColumnsForResults: true,

                rowTags: 'tr',
                cellTags: 'td',
                cellSeparator: '[\t ]+',
                joinNames: true
            });
        });

        it('handle extra configuration in constructor', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table, {
                hovering: false,
                prefixCls: 'table-',
                roundsColumns: '2,3'
            });

            expect(highlighter.players).toBe(0);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);
            expect(highlighter.hovering).toBe(false);
            expect(highlighter.rearranging).toBe(true);
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.configuration).toEqual({
                prefixCls: 'table-',
                rearrangedCls: 'rearranged',
                tableCls: 'table',
                gameCls: 'game',
                currentCls: 'current',

                results: {
                    won: '([0-9]+)\\+',
                    lost: '([0-9]+)\\-',
                    jigo: '([0-9]+)=',
                    unresolved: '([0-9]+)\\?'
                },

                startingRow: 0,
                placeColumn: null,
                roundsColumns: '2,3',
                ignoreOutOfBoundsRows: false,
                checkColumnsForResults: true,

                rowTags: 'tr',
                cellTags: 'td',
                cellSeparator: '[\t ]+',
                joinNames: true
            });
        });

        it('let reconfigure', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            highlighter.configure({
                startingRow: 1,
                rowTags: 'div'
            });

            expect(highlighter.players).toBe(0);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);
            expect(highlighter.hovering).toBe(true);
            expect(highlighter.rearranging).toBe(true);
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.configuration).toEqual({
                prefixCls: 'go-results-',
                rearrangedCls: 'rearranged',
                tableCls: 'table',
                gameCls: 'game',
                currentCls: 'current',

                results: {
                    won: '([0-9]+)\\+',
                    lost: '([0-9]+)\\-',
                    jigo: '([0-9]+)=',
                    unresolved: '([0-9]+)\\?'
                },

                startingRow: 1,
                placeColumn: null,
                roundsColumns: null,
                ignoreOutOfBoundsRows: false,
                checkColumnsForResults: true,

                rowTags: 'div',
                cellTags: 'td',
                cellSeparator: '[\t ]+',
                joinNames: true
            });
        });

        it('consists of readonly properties', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            expect(() => highlighter.players = 'any value').toThrow();
            expect(() => highlighter.player = 'any value').toThrow();
            expect(() => highlighter.games = 'any value').toThrow();
            expect(() => highlighter.element = 'any value').toThrow();
            expect(() => highlighter.configuration = 'any value').toThrow();
            expect(() => highlighter.isHighlighting = 'any value').toThrow();
            expect(() => highlighter.isRearranged = 'any value').toThrow();
        });

        it('allow modification of hovering and rearranging', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            highlighter.hovering = true;
            expect(highlighter.hovering).toBe(true);

            highlighter.hovering = false;
            expect(highlighter.hovering).toBe(false);

            highlighter.hovering = 2;
            expect(highlighter.hovering).toBe(true);

            highlighter.hovering = null;
            expect(highlighter.hovering).toBe(false);

            highlighter.rearranging = true;
            expect(highlighter.rearranging).toBe(true);

            highlighter.rearranging = false;
            expect(highlighter.rearranging).toBe(false);

            highlighter.rearranging = 2;
            expect(highlighter.rearranging).toBe(true);

            highlighter.rearranging = null;
            expect(highlighter.rearranging).toBe(false);
        });

        it('parse simple results', () => {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.players).toBe(8);
            expect(highlighter.player).toBe(null);
            expect(highlighter.opponents(1)).toEqual([2, 5, 6]);
            expect(highlighter.opponents(2)).toEqual([1, 3, 8]);
            expect(highlighter.opponents(3)).toEqual([2, 4, 7]);
            expect(highlighter.opponents(4)).toEqual([3, 5, 6]);
            expect(highlighter.opponents(5)).toEqual([1, 4, 7]);
            expect(highlighter.opponents(6)).toEqual([1, 4, 8]);
            expect(highlighter.opponents(7)).toEqual([3, 5, 8]);
            expect(highlighter.opponents(8)).toEqual([2, 6, 7]);
        });

        it('highlight using single object argument', () => {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            highlighter.highlight({ player: 1 });
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(1);
            expect(highlighter.games).toEqual([]);

            highlighter.highlight({ player: 2, rearrange: true });
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(true);
            expect(highlighter.player).toBe(2);
            expect(highlighter.games).toEqual([1, 3, 8]);

            highlighter.highlight({ player: null });
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);

            highlighter.highlight({ player: 4, games: 3 });
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3]);

            highlighter.highlight({ player: 4, games: [3, 6]});
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3, 6]);
        });

        it('highlight using multiple arguments', () => {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            highlighter.highlight(1);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(1);
            expect(highlighter.games).toEqual([]);

            highlighter.highlight(2, true);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(true);
            expect(highlighter.player).toBe(2);
            expect(highlighter.games).toEqual([1, 3, 8]);

            highlighter.highlight(3, false);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(3);
            expect(highlighter.games).toEqual([]);

            highlighter.highlight(null);
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);

            highlighter.highlight(4, 3);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3]);

            highlighter.highlight(4, 3, true);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(true);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3]);

            highlighter.highlight(4, 3, false);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3]);

            highlighter.highlight(4, [3, 6], true);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(true);
            expect(highlighter.player).toBe(4);
            expect(highlighter.games).toEqual([3, 6]);
        });

        it('restore order when disabling rearranging when table is already rearranged', () => {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            highlighter.highlight({ player: 1, rearrange: false, games: 2 });
            highlighter.rearranging = false;

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(1);
            expect(highlighter.games).toEqual([2]);

            highlighter.highlight({ player: 1, rearrange: true });
            highlighter.rearranging = false;

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isRearranged).toBe(false);
            expect(highlighter.player).toBe(null);
            expect(highlighter.games).toEqual([]);
        });
    });
});
