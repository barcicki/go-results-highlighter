module.exports = function (config) {
    config.set({
        basePath:   '',
        frameworks: ['browserify', 'jasmine'],

        files: [
            'src/**/*.js',
            'tests/**/*.js'
        ],

        exclude: [],
        preprocessors: {
            'src/**/*.js': ['browserify'],
            'tests/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: ['babelify']
        },

        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
        concurrency: Infinity
    })
};
