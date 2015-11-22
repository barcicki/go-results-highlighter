'use strict';

import GoResultsHighlighter from '../src/lib/highlighter';
import { DEFAULT_SETTINGS } from '../src/lib/settings';

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

const EXAMPLE_TOURNAMENT_WITH_ADDITIONAL_IDS_AND_CLASSES =
    `<table>
        <tbody>
            <tr id="row1"><td colspan="11">Example Tournament - After Round 3</td></tr>
            <tr id="row2"><td>Place</td><td>Name</td><td>Club</td><td>Level</td><td>Score</td><td>1</td><td>2</td><td>3</td><td>Points</td><td>SOS</td><td>SOSOS</td></tr>
            <tr id="row3"><td>1</td><td>Player 8</td><td>AAA</td><td>2 Kyu</td><td>28</td><td class="game1">6+</td><td class="game2">5+</td><td class="game3">2+</td><td>3</td><td>79</td><td>241</td></tr>
            <tr id="row4"><td>2</td><td>Player 4</td><td>BBB</td><td>4 Kyu</td><td>27</td><td class="game1">8+</td><td class="game2">3+</td><td class="game3">1-</td><td>2</td><td>80</td><td>238</td></tr>
            <tr id="row5"><td>3</td><td>Player 6</td><td>BBB</td><td>3 Kyu</td><td>27</td><td class="game1">4+</td><td class="game2">2-</td><td class="game3">7+</td><td>2</td><td>80</td><td>237</td></tr>
            <tr id="row6"><td>4</td><td>Player 2</td><td>CCC</td><td>3 Kyu</td><td>27</td><td class="game1">3-</td><td class="game2">6+</td><td class="game3">5+</td><td>2</td><td>79</td><td>241</td></tr>
            <tr id="row7"><td>5</td><td>Player 3</td><td>CCC</td><td>5 Kyu</td><td>26</td><td class="game1">7+</td><td class="game2">1-</td><td class="game3">4-</td><td>1</td><td>81</td><td>236</td></tr>
            <tr id="row8"><td>6</td><td>Player 7</td><td>AAA</td><td>5 Kyu</td><td>26</td><td class="game1">1-</td><td class="game2">4-</td><td class="game3">8+</td><td>1</td><td>80</td><td>237</td></tr>
            <tr id="row9"><td>7</td><td>Player 1</td><td>AAA</td><td>6 Kyu</td><td>26</td><td class="game1">5-</td><td class="game2">8+</td><td class="game3">3-</td><td>1</td><td>78</td><td>240</td></tr>
            <tr id="row10"><td>8</td><td>Player 5</td><td>BBB</td><td>8 Kyu</td><td>25</td><td class="game1">2-</td><td class="game2">7-</td><td class="game3">6-</td><td>0</td><td>79</td><td>238</td></tr>
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

        it('bind to table element with default settings', () => {
            let table = createDom('<table></table>');
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.element).toBe(table);
            expect(table.goResultsHighlighter).toBe(highlighter);
            expect(table.className).toBe('go-results-table');
            expect(highlighter.settings).toEqual(DEFAULT_SETTINGS);
        });

        it('bind to pre element with replacing it with table', () => {
            let pre = createDom('<pre></pre>');
            let highlighter = new GoResultsHighlighter(pre);

            expect(highlighter.element).not.toBe(pre);
            expect(pre.goResultsHighlighter).not.toBeDefined();
            expect(pre.className).not.toBe('go-results-table');
            expect(placeholder.firstChild).not.toBe(pre);
            expect(placeholder.firstChild).toBe(highlighter.element);
        });

        it('handle clean results', () => {
            let table = createDom(EXAMPLE_TOURNAMENT);
            let highlighter = new GoResultsHighlighter(table);

            expect(highlighter.players.length).toBe(8);
            expect(highlighter.map[1].opponents).toEqual([2, 5, 6]);
            expect(highlighter.map[8].opponents).toEqual([2, 6, 7]);
        });

        it('handle clean results with settings', () => {
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

    describe('should provide API able to', () => {
        let highlighter;
        let table;

        beforeEach(() => {
            table = createDom(EXAMPLE_TOURNAMENT);
            highlighter = new GoResultsHighlighter(table);
        });

        it('ensure no player is selected on start', () => {
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.current).toBe(null);

            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('select player using numeric argument', () => {
            highlighter.highlight(3);

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.current).toBe(3);

            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);

            expect(highlighter.map[3].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[4].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[7].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[2].row.classList.contains('go-results-lost')).toBeTruthy();
        });

        it('select player using object', () => {
            highlighter.highlight({
                player: 3
            });

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.current).toBe(3);

            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);

            expect(highlighter.map[3].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[4].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[7].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[2].row.classList.contains('go-results-lost')).toBeTruthy();
        });

        it('deselect player', () => {
            highlighter.highlight(3);
            highlighter.highlight(null);

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.current).toBe(null);

            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
        });

        it('change selected player', () => {
            highlighter.highlight(3);
            highlighter.highlight({ player: 3 });
            highlighter.highlight(7);

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.current).toBe(7);

            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(1);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(2);

            expect(highlighter.map[7].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[5].row.classList.contains('go-results-lost')).toBeTruthy();
            expect(highlighter.map[8].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[3].row.classList.contains('go-results-lost')).toBeTruthy();
        });

        it('deselect player after many changes', () => {
            highlighter.highlight(3);
            highlighter.highlight(2);
            highlighter.highlight(7);
            highlighter.highlight(null);

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.current).toBe(null);

            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
        });

        it('select player and mark game with opponent', () => {
            highlighter.highlight({
                player: 3,
                opponent: 2
            });

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.current).toBe(3);

            expect(table.querySelectorAll('.go-results-game').length).toBe(2);
        });

        it('select player and not mark any game if opponent doesn\'t exist', () => {
            highlighter.highlight({
                player: 3,
                opponent: 21
            });

            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('select player and not mark any game if opponent hasn\'t played with player', () => {
            highlighter.highlight({
                player: 3,
                opponent: 6
            });

            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('deselect player with marked game', () => {
            highlighter.highlight({
                player: 3,
                opponent: 7
            });
            highlighter.highlight(null);

            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('ensure all players are in proper order on start', () => {
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[8].row);
        });

        it('show player details using settings arguments', () => {
            highlighter.highlight({
                player: 3,
                compact: true
            });

            expect(highlighter.isShowingDetails).toBe(true);
            expect(table.classList.contains('go-results-showing-details')).toBeTruthy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);
            expect(table.querySelectorAll('.go-results-game').length).toBe(3);

            expect(highlighter.map[3].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[4].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[7].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[2].row.classList.contains('go-results-lost')).toBeTruthy();

            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[5].row);
        });

        it('ignore second argument if the first one is an object', () => {
            highlighter.highlight({
                player: 3
            }, true);

            expect(highlighter.isShowingDetails).toBe(false);
            expect(table.classList.contains('go-results-showing-details')).toBeFalsy();

            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[8].row);
        });

        it('show player details using two arguments', () => {
            highlighter.highlight(3, true);

            expect(highlighter.isShowingDetails).toBe(true);
            expect(table.classList.contains('go-results-showing-details')).toBeTruthy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);
            expect(table.querySelectorAll('.go-results-game').length).toBe(3);

            expect(highlighter.map[3].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[4].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[7].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[2].row.classList.contains('go-results-lost')).toBeTruthy();

            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[5].row);
        });

        it('show player details with single game highlighted', () => {
            highlighter.highlight({
                player: 3,
                opponent: 7,
                compact: true
            });

            expect(highlighter.isShowingDetails).toBe(true);
            expect(table.classList.contains('go-results-showing-details')).toBeTruthy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);
            expect(table.querySelectorAll('.go-results-game').length).toBe(2);

            expect(highlighter.map[3].row.classList.contains('go-results-current')).toBeTruthy();
            expect(highlighter.map[4].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[7].row.classList.contains('go-results-won')).toBeTruthy();
            expect(highlighter.map[2].row.classList.contains('go-results-lost')).toBeTruthy();

            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[5].row);
        });

        it('hide player details', () => {
            highlighter.highlight(3, true);
            highlighter.highlight(-1);

            expect(highlighter.isShowingDetails).toBe(false);
            expect(table.classList.contains('go-results-showing-details')).toBeFalsy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[8].row);
        });

        it('change player details', () => {
            highlighter.highlight(3, true);
            highlighter.highlight({ player: 5, compact: true });
            highlighter.highlight(6, true);

            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[1].row);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[8].row);
            expect(highlighter.map[8].row.nextElementSibling).toBe(highlighter.map[7].row);
        });

        it('hide player details after changes', () => {
            highlighter.highlight(3, true);
            highlighter.highlight(5, true);
            highlighter.highlight({ player: 6, compact: true });
            highlighter.highlight(-1);

            expect(highlighter.isShowingDetails).toBe(false);
            expect(table.classList.contains('go-results-showing-details')).toBeFalsy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[8].row);
        });

        it('select player then show details', () => {
            highlighter.highlight(3);
            highlighter.highlight(5, true);

            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
            expect(table.classList.contains('go-results-showing-details')).toBeTruthy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(1);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(2);
            expect(table.querySelectorAll('.go-results-game').length).toBe(3);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[1].row);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[8].row);
        });

        it('show details then select player', () => {
            highlighter.highlight(3, true);
            highlighter.highlight(5);

            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
            expect(table.classList.contains('go-results-showing-details')).toBeFalsy();
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(1);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(2);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
            expect(highlighter.map[1].row.nextElementSibling).toBe(highlighter.map[2].row);
            expect(highlighter.map[2].row.nextElementSibling).toBe(highlighter.map[3].row);
            expect(highlighter.map[3].row.nextElementSibling).toBe(highlighter.map[4].row);
            expect(highlighter.map[4].row.nextElementSibling).toBe(highlighter.map[5].row);
            expect(highlighter.map[5].row.nextElementSibling).toBe(highlighter.map[6].row);
            expect(highlighter.map[6].row.nextElementSibling).toBe(highlighter.map[7].row);
            expect(highlighter.map[7].row.nextElementSibling).toBe(highlighter.map[8].row);
        });
    });

    describe('should support mouse events', () => {
        let highlighter;
        let table;

        beforeEach(() => {
            table = createDom(EXAMPLE_TOURNAMENT_WITH_ADDITIONAL_IDS_AND_CLASSES);
            highlighter = new GoResultsHighlighter(table);

            spyOn(highlighter, 'highlight').and.callThrough();
        });

        it('not mark any player when hovering non-player rows', () => {
            let event = new MouseEvent('mouseover', { bubbles: true });

            table.querySelector('#row2').firstChild.dispatchEvent(event);

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('mark player and opponents when hovering player rows', () => {
            let event = new MouseEvent('mouseover', { bubbles: true });

            table.querySelector('#row5').dispatchEvent(event);

            expect(highlighter.current).toBe(3);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isShowingDetails).toBe(false);
        });

        it('mark player, opponents and opponent\'s game when hovering game result in player row', () => {
            let event = new MouseEvent('mouseover', { bubbles: true });

            table.querySelector('#row5').querySelector('.game3').dispatchEvent(event);

            expect(highlighter.highlight).toHaveBeenCalledWith({ player: 3, opponent: 7 });
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isShowingDetails).toBe(false);
        });

        it('not mark any player when hovering settings is disabled', () => {
            highlighter.settings.hovering = false;

            let event = new MouseEvent('mouseover', { bubbles: true });

            table.querySelector('#row5').querySelector('.game3').dispatchEvent(event);

            expect(highlighter.highlight).not.toHaveBeenCalled();
            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isShowingDetails).toBe(false);
        });

        it('mark last hovered player', () => {
            table.querySelector('#row3').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row7').querySelector('.game1').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row5').querySelector('.game3').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row6').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row8').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.highlight.calls.count()).toBe(5);
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(1);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(2);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('unmark all players when hovering non-player rows', () => {
            table.querySelector('#row3').querySelector('.game1').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row1').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('unmark players when not hovering table', () => {
            table.querySelector('#row5').querySelector('.game3').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: table.querySelector('#row5') }));
            table.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: table.parentNode }));

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('do nothing when clicking non-player rows', () => {
            table.querySelector('#row1').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.current).toBe(null);
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('show details when clicking player row', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.current).toBe(3);
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(2);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(1);
            expect(table.querySelectorAll('.go-results-game').length).toBe(3);
        });

        it('do nothing when clicking is disabled', () => {
            highlighter.settings.clicking = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.isHighlighting).toBe(false);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.highlight).not.toHaveBeenCalled();
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });

        it('hide details when clicking the same player when showing details but keep player highlighted', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('hide details when clicking non-player rows when showing details', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            table.querySelector('#row1').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('disable hovering when showing details', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            highlighter.highlight.calls.reset();

            table.querySelector('#row3').querySelector('.game3').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            table.querySelector('#row7').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            expect(highlighter.highlight).not.toHaveBeenCalled();
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('show details of selected opponent', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            table.querySelector('#row9').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
            expect(table.querySelectorAll('.go-results-won').length).toBe(1);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(2);
        });

        it('mark player selected without hovering when hiding details', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            table.querySelector('#row10').querySelector('.game1').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
            expect(highlighter.current).toBe(8);
            expect(table.querySelectorAll('.go-results-current').length).toBe(1);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(3);
            expect(table.querySelectorAll('.go-results-game').length).toBe(2);
        });

        it('not mark any player when hiding details and hovering setting is disabled', () => {
            highlighter.settings.hovering = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            table.querySelector('#row10').querySelector('.game1').dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(highlighter.highlight.calls.count()).toBe(2);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
            expect(table.querySelectorAll('.go-results-current').length).toBe(0);
            expect(table.querySelectorAll('.go-results-won').length).toBe(0);
            expect(table.querySelectorAll('.go-results-lost').length).toBe(0);
            expect(table.querySelectorAll('.go-results-game').length).toBe(0);
        });
    });

    /**
     * Currently TouchEvent constructor is not available to use therefore
     * MouseEvent is used in its place.
     */
    describe('should support touch events', () => {

        let highlighter;
        let table;

        beforeEach(() => {
            table = createDom(EXAMPLE_TOURNAMENT_WITH_ADDITIONAL_IDS_AND_CLASSES);
            highlighter = new GoResultsHighlighter(table);
        });

        it('highlight player and opponents when touched', () => {
            let el = table.querySelector('#row5');

            el.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(3);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('ignore touchend event when touchmove was triggered', function () {
            let el = table.querySelector('#row5');

            el.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('touchmove', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('change highlight when touched other player', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row6').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(4);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('show details when highlighted player touched again', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(3);
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('change details when touched other player in compact mode', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row4').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(2);
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('hide details but keep highlighted when touched highlighted player in compact mode', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(3);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('hide highlight when touching non-player row', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row1').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('hide highlight and restore natural order when touching non-player row in compact mode', () => {
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row1').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('remove highlight instead of entering compact mode if clicking is disabled when touched the highlighted player second time', () => {
            highlighter.settings.clicking = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('enter compact mode if hovering is disabled and touched any player', () => {
            highlighter.settings.hovering = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(3);
            expect(highlighter.isShowingDetails).toBe(true);
            expect(highlighter.isHighlighting).toBe(true);
        });

        it('remove highlight when touched highlighted player again and hovering is disabled', () => {
            highlighter.settings.hovering = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));
            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

        it('do nothing on touch when clicking and hovering is disabled', () => {
            highlighter.settings.hovering = false;
            highlighter.settings.clicking = false;

            table.querySelector('#row5').dispatchEvent(new MouseEvent('touchend', { bubbles: true }));

            expect(highlighter.current).toBe(null);
            expect(highlighter.isShowingDetails).toBe(false);
            expect(highlighter.isHighlighting).toBe(false);
        });

    });
});
