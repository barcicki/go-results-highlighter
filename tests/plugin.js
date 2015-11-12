'use strict';

import GoResultsHighlighter from '../src/plugin';
import { DEFAULT_SETTINGS } from '../src/settings';

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

const EXAMPLE_TOURNAMENT_WITH_SETTINGS =
    `<table data-go-starting-row="2" data-go-hovering="false" data-go-place-col="1" data-go-rounds-cols="6,8">
        <tbody>
            <tr><td colspan="12">Example Tournament - After Round 3</td></tr>
            <tr><td>St. pos</td><td>Place</td><td>Name</td><td>Club</td><td>Level</td><td>Score</td><td>1</td><td>2</td><td>3</td><td>Points</td><td>SOS</td><td>SOSOS</td></tr>
            <tr><td>1</td><td>1</td><td>Player 8</td><td>AAA</td><td>2 Kyu</td><td>28</td><td>6+</td><td>5+</td><td>2+</td><td>3</td><td>79</td><td>241</td></tr>
            <tr><td>2</td><td>2</td><td>Player 4</td><td>BBB</td><td>4 Kyu</td><td>27</td><td>8+</td><td>3+</td><td>1-</td><td>2</td><td>80</td><td>238</td></tr>
            <tr><td>3</td><td>3</td><td>Player 6</td><td>BBB</td><td>3 Kyu</td><td>27</td><td>4+</td><td>2-</td><td>7+</td><td>2</td><td>80</td><td>237</td></tr>
            <tr><td>4</td><td>4</td><td>Player 2</td><td>CCC</td><td>3 Kyu</td><td>27</td><td>3-</td><td>6+</td><td>5+</td><td>2</td><td>79</td><td>241</td></tr>
            <tr><td>5</td><td>5</td><td>Player 3</td><td>CCC</td><td>5 Kyu</td><td>26</td><td>7+</td><td>1-</td><td>4-</td><td>1</td><td>81</td><td>236</td></tr>
            <tr><td>6</td><td>6</td><td>Player 7</td><td>AAA</td><td>5 Kyu</td><td>26</td><td>1-</td><td>4-</td><td>8+</td><td>1</td><td>80</td><td>237</td></tr>
            <tr><td>7</td><td>7</td><td>Player 1</td><td>AAA</td><td>6 Kyu</td><td>26</td><td>5-</td><td>8+</td><td>3-</td><td>1</td><td>78</td><td>240</td></tr>
            <tr><td>8</td><td>8</td><td>Player 5</td><td>BBB</td><td>8 Kyu</td><td>25</td><td>2-</td><td>7-</td><td>6-</td><td>0</td><td>79</td><td>238</td></tr>
        </tbody>
    </table>`;

describe('GoResultsHighlighter', () => {
    let placeholder;

    beforeAll(() => placeholder = document.createElement('div'));

    function createDom(dom) {
        placeholder.innerHTML = dom;
        return placeholder.firstChild;
    }

    fdescribe('should be able to', () => {

        it('bind to table element with default settings', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.element).toBe(table);
            expect(table.goResultsHighlighter).toBe(highlighter);
            expect(table.className).toBe('go-results-table');
            expect(highlighter.settings).toEqual(DEFAULT_SETTINGS);
        });

        it('bind to pre element with replacing it with table', function () {
            let pre = createDom('<pre></pre>');
            let highlighter = new GoResultsHighlighter(pre);

            expect(highlighter.element).not.toBe(pre);
            expect(pre.goResultsHighlighter).not.toBeDefined();
            expect(pre.className).not.toBe('go-results-table');
            expect(placeholder.firstChild).not.toBe(pre);
            expect(placeholder.firstChild).toBe(highlighter.element);
        });

        it('handle clean results', function () {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.players.length).toBe(8);
            expect(highlighter.map[1].opponents).toEqual([2, 5, 6]);
            expect(highlighter.map[8].opponents).toEqual([2, 6, 7]);
        });

        it('handle clean results with settings', function () {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table, {
                roundsColumns: '5,7'
            });

            expect(highlighter.players.length).toBe(8);
            expect(highlighter.map[1].opponents).toEqual([2, 6]);
            expect(highlighter.map[8].opponents).toEqual([2, 6]);
        });

        it('read settings from DOM', () => {
            let table = createDom(EXAMPLE_TOURNAMENT_WITH_SETTINGS);
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.settings.hovering).toBe(false);
            expect(highlighter.settings.roundsColumns).toBe('6,8');
            expect(highlighter.settings.startingRow).toBe(2);
            expect(highlighter.settings.placeColumn).toBe(1);
            expect(highlighter.players.length).toBe(8);
            expect(highlighter.map[1].opponents).toEqual([2, 6]);
            expect(highlighter.map[8].opponents).toEqual([2, 6]);
        });

        it('override DOM settings', () => {
            let table = createDom(EXAMPLE_TOURNAMENT_WITH_SETTINGS);
            let highlighter = new GoResultsHighlighter(table, {
                startingRow: 0,
                roundsColumns: null,
                hovering: true
            });

            expect(highlighter.settings.hovering).toBe(true);
            expect(highlighter.settings.roundsColumns).toBe(null);
            expect(highlighter.settings.startingRow).toBe(0);
            expect(highlighter.settings.placeColumn).toBe(1);
            expect(highlighter.map[1].opponents).toEqual([2, 5, 6]);
            expect(highlighter.map[8].opponents).toEqual([2, 6, 7]);
        });



    });
});
