'use strict';

module.exports = function (config) {
    config.set({
        basePath:   '',
        frameworks: ['jasmine', 'browserify'],

        files: [
            { pattern: 'src/**/*.js', included: false },
            { pattern: 'tests/**/*.*', included: false },
            { pattern: 'tests/**/*.js', included: true }
        ],
        exclude: [],

        preprocessors: {
            'src/**/*.js': ['browserify', 'coverage'],
            'tests/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: ['babelify', 'browserify-istanbul']
        },

        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
        concurrency: Infinity
    });
};
