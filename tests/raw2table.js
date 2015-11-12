'use strict';

import raw2table from '../src/raw2table';

function loadFile(path, cb) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', path);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                cb(null, xhr.responseText);
            } else {
                cb(xhr.statusText);
            }
        }
    };

    xhr.send();

    return xhr;
}

function testFile(path, cb) {
    return (done) => {
        loadFile('/base/tests/results/' + path, (err, data) => {
            if (err) {
                done.fail('Could not load file');
            } else {
                cb(data);
                done();
            }
        });
    };
}

describe('raw2table', () => {
    describe('should be able to', () => {

        it('return table even on empty strings', function () {
            expect(raw2table('') instanceof HTMLTableElement).toBeTruthy();
            expect(raw2table() instanceof HTMLTableElement).toBeTruthy();
            expect(raw2table('\r\n') instanceof HTMLTableElement).toBeTruthy();
        });

        it('parse macmahon raw results', testFile('macmahon.txt', (data) => {
            const result = raw2table(data);

            expect(result instanceof HTMLTableElement).toBeTruthy();

            const rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(26);
            expect(rows[0].childNodes.length).toBe(1);
            expect(rows[1].querySelectorAll('td').length).toBe(13);

            const player1 = rows[2];

            expect(player1.querySelectorAll('td').length).toBe(13);
            expect(player1.hasAttribute('data-go-place')).toBeTruthy();
            expect(player1.getAttribute('data-go-place')).toBe('1');
            expect(player1.getAttribute('data-go-opponents')).toBe('5,4,3,2,6');
            expect(player1.querySelectorAll('[data-go-opponent]').length).toBe(5);

            const player13 = result.querySelector('[data-go-place="13"]');

            expect(player13).not.toBeNull();
            expect(player13 instanceof HTMLTableRowElement).toBeTruthy();
            expect(player13.querySelectorAll('[data-go-opponent]').length).toBe(5);
            expect(player13.getAttribute('data-go-opponents')).toBe('12,15,5,14,16');
            expect(player13.querySelectorAll('[data-go-result="lost"]').length).toBe(3);
            expect(player13.querySelectorAll('[data-go-result="won"]').length).toBe(2);
        }));

        it('handle superfluous newlines when parsing macmahon results', testFile('macmahon.newlines.txt', (data) => {
            const result = raw2table(data);
            const rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(26);
            expect(rows[0].childNodes.length).toBe(1);
            expect(rows[1].querySelectorAll('td').length).toBe(13);

            const player1 = rows[2];

            expect(player1.querySelectorAll('td').length).toBe(13);
            expect(player1.hasAttribute('data-go-place')).toBeTruthy();
            expect(player1.getAttribute('data-go-place')).toBe('1');
            expect(player1.getAttribute('data-go-opponents')).toBe('5,4,3,2,6');
            expect(player1.querySelectorAll('[data-go-opponent]').length).toBe(5);

            const player13 = result.querySelector('[data-go-place="13"]');

            expect(player13).not.toBeNull();
            expect(player13 instanceof HTMLTableRowElement).toBeTruthy();
            expect(player13.querySelectorAll('[data-go-opponent]').length).toBe(5);
            expect(player13.getAttribute('data-go-opponents')).toBe('12,15,5,14,16');
            expect(player13.querySelectorAll('[data-go-result="lost"]').length).toBe(3);
            expect(player13.querySelectorAll('[data-go-result="won"]').length).toBe(2);
        }));

        it('parse macmahon raw results with changed starting row', testFile('macmahon.txt', (data) => {
            const result = raw2table(data, {
                startingRow: 3
            });

            expect(result instanceof HTMLTableElement).toBeTruthy();

            const rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(26);
            expect(rows[0].childNodes.length).toBe(1);
            expect(rows[2].querySelectorAll('td').length).toBe(1);
            expect(rows[2].querySelectorAll('[data-go-opponent]').length).toBe(0);
            expect(rows[2].hasAttribute('data-go-place')).toBeTruthy();
            expect(rows[2].getAttribute('data-go-place')).toBe('-1');

            expect(rows[3].querySelectorAll('td').length).toBe(13);
            expect(rows[3].querySelectorAll('[data-go-opponent]').length).toBe(5);
            expect(rows[3].hasAttribute('data-go-place')).toBeTruthy();
            expect(rows[3].getAttribute('data-go-place')).toBe('2');
        }));

        it('parse macmahon raw results with changed column place', testFile('macmahon.column.txt', (data) => {
            const result = raw2table(data, {
                placeColumn: 1
            });

            expect(result instanceof HTMLTableElement).toBeTruthy();

            const rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(26);
            expect(rows[0].childNodes.length).toBe(1);
            expect(rows[2].querySelectorAll('td').length).toBe(14);
            expect(rows[2].getAttribute('data-go-place')).toBe('1');
            expect(rows[3].getAttribute('data-go-place')).toBe('2');
            expect(rows[21].getAttribute('data-go-place')).toBe('20');
        }));

        it('parse macmahon raw results with selected cols with games', testFile('macmahon.txt', (data) => {
            const result = raw2table(data, {
                roundsColumns: '6,7'
            });

            expect(result instanceof HTMLTableElement).toBeTruthy();

            const rows = result.querySelectorAll('tr');

            expect(rows[2].querySelectorAll('[data-go-opponent]').length).toBe(2);
            expect(rows[2].getAttribute('data-go-opponents')).toBe('4,3');
            expect(rows[7].querySelectorAll('[data-go-opponent]').length).toBe(2);
            expect(rows[7].getAttribute('data-go-opponents')).toBe('8,7');
        }));


        it('parse macmahon progress raw results', testFile('macmahon.progress.txt', (data) => {
            const result = raw2table(data);
            const rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(26);

            const player1 = rows[2];

            expect(player1.querySelectorAll('td').length).toBe(11);
            expect(player1.querySelectorAll('[data-go-opponent]').length).toBe(3);
            expect(player1.getAttribute('data-go-opponents')).toBe('5,4,2');
            expect(player1.querySelectorAll('[data-go-result="won"]').length).toBe(2);
            expect(player1.querySelectorAll('[data-go-result="unresolved"]').length).toBe(1);

            const player2 = result.querySelector('[data-go-place="9"]');

            expect(player2.querySelectorAll('[data-go-opponent]').length).toBe(3);
            expect(player2.getAttribute('data-go-opponents')).toBe('12,6,10');
            expect(player2.querySelectorAll('[data-go-result="lost"]').length).toBe(1);
            expect(player2.querySelectorAll('[data-go-result="won"]').length).toBe(1);
            expect(player2.querySelectorAll('[data-go-result="unresolved"]').length).toBe(1);
        }));


        it('parse macmahon EGD export results', testFile('macmahon.egd.txt', (data) => {
            let result = raw2table(data, {
                roundsColumns: '9, 10, 11, 12, 13'
            });

            expect(result instanceof HTMLTableElement).toBeTruthy();

            let rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(24);
            expect(rows[0].querySelectorAll('td').length).toBe(14);
            expect(rows[0].hasAttribute('data-go-place')).toBeTruthy();
            expect(rows[0].getAttribute('data-go-place')).toBe('1');
            expect(rows[23].getAttribute('data-go-place')).toBe('24');

            let player13 = result.querySelector('[data-go-place="13"]');

            expect(player13).not.toBeNull();
            expect(player13 instanceof HTMLTableRowElement).toBeTruthy();
            expect(player13.querySelectorAll('[data-go-opponent]').length).toBe(5);
            expect(player13.querySelectorAll('[data-go-result="lost"]').length).toBe(3);
            expect(player13.querySelectorAll('[data-go-result="won"]').length).toBe(2);
        }));

        it('parse OpenGotha EGD export results', testFile('opengotha.egd.h9', (data) => {
            let result = raw2table(data);

            expect(result instanceof HTMLTableElement).toBeTruthy();

            let rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(8);
            expect(rows[0].querySelectorAll('td').length).toBe(12);
            expect(rows[0].hasAttribute('data-go-place')).toBeTruthy();
            expect(rows[0].getAttribute('data-go-place')).toBe('1');
            expect(rows[7].getAttribute('data-go-place')).toBe('8');

            let player5 = result.querySelector('[data-go-place="5"]');

            expect(player5).not.toBeNull();
            expect(player5 instanceof HTMLTableRowElement).toBeTruthy();
            expect(player5.querySelectorAll('[data-go-opponent]').length).toBe(3);
            expect(player5.getAttribute('data-go-opponents')).toEqual('4,1,3');
            expect(player5.querySelectorAll('[data-go-result="lost"]').length).toBe(2);
            expect(player5.querySelectorAll('[data-go-result="won"]').length).toBe(1);
        }));

        it('parse OpenGotha FFG export results', testFile('opengotha.ffg.tou', (data) => {
            let result = raw2table(data);

            expect(result instanceof HTMLTableElement).toBeTruthy();

            let rows = result.querySelectorAll('tr');

            expect(rows.length).toBe(8);
            expect(rows[0].querySelectorAll('td').length).toBe(7);
            expect(rows[0].hasAttribute('data-go-place')).toBeTruthy();
            expect(rows[0].getAttribute('data-go-place')).toBe('1');
            expect(rows[7].getAttribute('data-go-place')).toBe('8');

            let player5 = result.querySelector('[data-go-place="5"]');

            expect(player5).not.toBeNull();
            expect(player5 instanceof HTMLTableRowElement).toBeTruthy();
            expect(player5.querySelectorAll('[data-go-opponent]').length).toBe(3);
            expect(player5.getAttribute('data-go-opponents')).toEqual('4,1,3');
            expect(player5.querySelectorAll('[data-go-result="lost"]').length).toBe(2);
            expect(player5.querySelectorAll('[data-go-result="won"]').length).toBe(1);
        }));
    });
});
