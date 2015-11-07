'use strict';

const pjson = require('../package.json');

module.exports = {
    name: 'GoResultsHighlighter',
    paths: {
        dest: './dist',
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
        },
        site: {
            jades: {
                pages: './site/pages/**/*.jade',
                all: './site/**/*.jade',
                dest: './dist'
            },
            css: {
                entry: './site/styles/styles.less',
                all: './site/styles/**/*.less',
                dest: './dist/styles'
            },
            js: {
                entry: './site/scripts/main.js',
                all: './site/scripts/**/*.js',
                dest: './dist/scripts'
            }
        }
    },
    names: {
        css: {
            entry: 'plugin.less',
            dest: `${pjson.name}.css`,
            prod: `${pjson.name}.min.css`
        },
        js: {
            entry: 'index.js',
            dest: `${pjson.name}.js`,
            prod: `${pjson.name}.min.js`
        }
    }
};