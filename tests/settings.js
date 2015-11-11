'use strict';

import { readTableSettingsFromDOM } from '../src/settings';

describe('settings', () => {

    let placeholder;

    beforeAll(() => placeholder = document.createElement('div'));

    function testReadingSettings(dom) {
        placeholder.innerHTML = dom;

        return readTableSettingsFromDOM(placeholder.firstChild);
    }

    describe('readTableFromSettings should able to', function () {
        it('return empty object if no settings found', function () {
            expect(testReadingSettings('<table></table>')).toEqual({});
        });

        it('return starting row settings', function () {
            expect(testReadingSettings('<table data-go-starting-row="4">')).toEqual({ startingRow: 4 });
        });

        it('return place column settings', function () {
            expect(testReadingSettings('<table data-go-place-col="2">')).toEqual({ placeColumn: 2 });
        });

        it('return game rounds columns settings', function () {
            expect(testReadingSettings('<table data-go-rounds-cols="1,2,3,4">')).toEqual({ roundsColumns: '1,2,3,4' });
        });

        it('return clicking settings', function () {
            expect(testReadingSettings('<table data-go-clicking>')).toEqual({ clicking: true });
            expect(testReadingSettings('<table data-go-clicking="true">')).toEqual({ clicking: true });
            expect(testReadingSettings('<table data-go-clicking="false">')).toEqual({ clicking: false });
        });

        it('return hovering settings', function () {
            expect(testReadingSettings('<table data-go-hovering>')).toEqual({ hovering: true });
            expect(testReadingSettings('<table data-go-hovering="true">')).toEqual({ hovering: true });
            expect(testReadingSettings('<table data-go-hovering="false">')).toEqual({ hovering: false });
        });

        it('return all settings', function () {
            expect(testReadingSettings('<table data-go-rounds-cols="1,2,3,4" data-go-place-col="2" data-go-starting-row="4" data-go-hovering data-go-clicking="false">')).toEqual({
                startingRow: 4,
                placeColumn: 2,
                roundsColumns: '1,2,3,4',
                hovering: true,
                clicking: false
            });
        });
    });

});