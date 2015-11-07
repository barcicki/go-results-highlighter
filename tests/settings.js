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

        it('return all settings', function () {
            expect(testReadingSettings('<table data-go-rounds-cols="1,2,3,4" data-go-place-col="2" data-go-starting-row="4">')).toEqual({
                startingRow: 4,
                placeColumn: 2,
                roundsColumns: '1,2,3,4'
            });
        });
    });

});