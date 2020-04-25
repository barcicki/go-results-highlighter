const WEBPACK_CONFIGURATION = require('./webpack/test');

module.exports = function (config) {
  const configuration = {
    basePath: '',
    frameworks: ['jasmine'],

    files: [
      'tests/**/*.js',
      { pattern: 'src/**/*.js', included: true },
      { pattern: 'tests/**/*.*', included: false }
    ],

    exclude: [
      './src/bookmark.js'
    ],

    preprocessors: {
      'src/**/*.js': ['webpack'], // coverage is collected via babel-plugin-istanbul
      'tests/**/*.js': ['webpack']
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
        { type: 'text-summary', subdir: '.', file: 'summary.txt' },
        { type: 'in-memory' }
      ]
    },

    remapCoverageReporter: {
      'text-summary': './coverage/summary2.txt',
      json: './coverage/coverage.json',
      html: './coverage/html'
    },

    webpack: {
      ...WEBPACK_CONFIGURATION,
      mode: 'none'
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity
  };

  if (process.env.TRAVIS) {
    configuration.reporters.push('coveralls');
  }

  config.set(configuration);
};
