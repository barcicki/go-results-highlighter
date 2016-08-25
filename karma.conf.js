'use strict';

module.exports = function (config) {
    var configuration = {
        basePath:   '',
        frameworks: ['jasmine', 'browserify'],

        files: [
            { pattern: 'src/**/*.js', included: false },
            { pattern: 'tests/**/*.*', included: false },
            { pattern: 'tests/**/*.js', included: true }
        ],
        exclude: [
            './src/bookmark.js'
        ],

        preprocessors: {
            'src/**/*.js': ['browserify', 'coverage'],
            'tests/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: ['babelify', ['browserify-istanbul', {
                instrumenterConfig: {
                    embedSource: true
                }
            }]]
        },

        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: true,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: true
        },

        reporters: ['spec', 'coverage'],

        coverageReporter: {
            dir: 'coverage',
            reporters: [
                { type: 'html', subdir: '.' },
                { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
                { type: 'text-summary', subdir: '.', file: 'summary.txt' }
            ]
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        concurrency: Infinity
    };

    if (process.env.TRAVIS) {
        configuration.browsers = ['Firefox'];
        configuration.reporters.push('coveralls');
    }

    config.set(configuration);
};
