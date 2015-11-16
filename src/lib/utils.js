'use strict';

/**
 * Transforms array-like objects (such as arguments or node lists) into an array
 * @param {*} arrayLike
 * @returns {Array.<T>}
 */
export function asArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

/**
 * Returns new object containing keys only from defaultObj but values are taken
 * from if exist (starting from the last object provided)
 * @param {object} defaultObj
 * @param {Array.<object>} ...objects
 * @returns {object}
 */
export function defaults(defaultObj, ...objects) {
    const overrides = objects
        .filter((obj) => typeof obj === 'object')
        .reverse();

    const count = overrides.length;
    const result = {};

    mainLoop: for (let key in defaultObj) {
        for (let i = 0; i < count; i++) {
            if (overrides[i].hasOwnProperty(key)) {
                result[key] = overrides[i][key];
                continue mainLoop;
            }
        }

        result[key] = defaultObj[key];
    }

    return result;
}

/**
 * Returns new object that has merged properties from all provided objects.
 * Latest arguments overrides the earlier values.
 * @param {Array.<object>} objects
 * @returns {object}
 */
export function combine(...objects) {
    const result = {};

    objects.forEach((object) => {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                result[key] = object[key];
            }
        }
    });

    return result;
}