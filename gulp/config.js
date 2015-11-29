'use strict';

const pjson = require('../package.json');

module.exports = {
    package: pjson.name,
    name: 'GoResultsHighlighter',
    paths: {
        src: './src',
        dest: './dist',
        tests: {
            all: './tests/**/*.*'
        },
        tasks: {
            all: './gulp/**/*.*'
        },
        css: {
            entry: './src/styles/highlighter.less',
            all: './src/**/*.less',
            dest: './dist'
        },
        js: {
            entry: './src/index.js',
            all: './src/**/*.js',
            dest: './dist'
        },
        site: {
            all: './dist/**/*.*',
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
            },
            assets: {
                all: './site/assets/**/*.*',
                dest: './dist/assets'
            },
            resources: {
                all: ['./site/resources/**/*.*', './README.md']
            }
        }
    },
    names: {
        css: {
            entry: 'highlighter.less',
            dest: `${pjson.name}.css`,
            prod: `${pjson.name}.min.css`
        },
        js: {
            entry: 'index.js',
            dest: `${pjson.name}.js`,
            map: `${pjson.name}.map.js`,
            prod: `${pjson.name}.min.js`
        }
    }
};
