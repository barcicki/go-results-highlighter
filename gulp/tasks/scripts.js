'use strict';

const gulp = require('gulp');
const path = require('path');
const config = require('../config');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

gulp.task('build-js-dev', () => {
    return gulp.src(config.paths.js.entry)
        .pipe(browserify({
            transform: ['babelify'],
            debug: true,
            standalone: config.name
        }))
        .pipe(rename(config.names.js.dest))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js-site', () => {
    return gulp.src(config.paths.site.js.entry)
        .pipe(browserify({
            transform: ['babelify'],
            debug: true
        }))
        .pipe(gulp.dest(config.paths.site.js.dest));
});

gulp.task('build-js-prod', ['build-js-dev'], () => {
    return gulp.src(path.resolve(config.paths.js.dest, config.names.js.dest))
        .pipe(uglify())
        .pipe(rename(config.names.js.prod))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js', ['build-js-dev', 'build-js-prod', 'build-js-site']);