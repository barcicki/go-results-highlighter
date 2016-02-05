'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('build-js-dev', () => {
    const path = require('path');
    const exorcist = require('exorcist');
    const rename = require('gulp-rename');
    const replace = require('gulp-replace');
    const browserify = require('gulp-browserify');
    const transform = require('vinyl-transform');

    return gulp.src(config.paths.js.entry)

        // dirty hack replacing export default with module.exports
        // due to the change in babel resulting with no possiblity to export
        // default properties without omitting default property
        .pipe(replace(`export default ${config.name};`, `module.exports = ${config.name};`))

        .pipe(browserify({
            transform: ['babelify'],
            debug: true,
            standalone: config.name
        }))
        .pipe(rename(config.names.js.dest))

        // extract source map to separate file
        .pipe(transform(() => exorcist(path.join(config.paths.js.dest, config.names.js.map), null, config.package, '.')))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js-site', () => {
    const browserify = require('gulp-browserify');

    return gulp.src(config.paths.site.js.entry)
        .pipe(browserify({
            transform: ['babelify'],
            sourceType: 'module',
            debug: true
        }))
        .pipe(gulp.dest(config.paths.site.js.dest));
});

gulp.task('build-js-prod', ['build-js-dev'], () => {
    const path = require('path');
    const uglify = require('gulp-uglify');
    const rename = require('gulp-rename');

    return gulp.src(path.resolve(config.paths.js.dest, config.names.js.dest))
        .pipe(uglify())
        .pipe(rename(config.names.js.prod))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js', ['build-js-dev', 'build-js-prod', 'build-js-site']);