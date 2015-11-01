'use strict';

const pjson = require('../package.json');

module.exports = {
    name: 'GoResultsHighlighter',
    paths: {
        examples: './examples',
        tests: {
            all: './tests/**/*.*'
        },
        tasks: {
            all: './gulp/**/*.*'
        },
        css: {
            entry: './src/plugin.less',
            all: './src/**/*.less',
            dest: './dist'
        },
        js: {
            entry: './src/index.js',
            all: './src/**/*.js',
            dest: './dist'
        }
    },
    names: {
        css: {
            entry: 'plugin.less',
            dest: `${pjson.name}.css`
        },
        js: {
            entry: 'index.js',
            dest: `${pjson.name}.js`,
            prod: `${pjson.name}.min.js`
        }
    }
};