'use strict';

import { defaults } from '../src/plugin.js';

describe('utilities', () => {
    describe('defaults function should be able to', () => {

        it('return copy of single argument', function () {
            let test = { test: 1 };
            let applied = defaults(test);

            expect(applied).toEqual(test);
            expect(applied).not.toBe(test);
        });

        it('return copy of first argument with overriden params', function () {
            expect(defaults({
                test1: 1,
                test2: 1,
                test3: 1
            }, {
                test2: 2,
                test3: 6
            }, {
                test3: 7
            }, {
                notInScope: 'a'
            })).toEqual({
                test1: 1,
                test2: 2,
                test3: 7
            });
        });
    })
});