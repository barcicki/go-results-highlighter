'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('build-css-dev', () => {
    const less = require('gulp-less');
    const rename = require('gulp-rename');

    return gulp.src(config.paths.css.entry)
        .pipe(less())
        .pipe(rename(config.names.css.dest))
        .pipe(gulp.dest(config.paths.css.dest));
});

gulp.task('build-css-prod', () => {
    const less = require('gulp-less');
    const rename = require('gulp-rename');
    const CleanCssPlugin = require('less-plugin-clean-css');
    const cleancss = new CleanCssPlugin({ advanced: true });

    return gulp.src(config.paths.css.entry)
        .pipe(less({
            plugins: [cleancss]
        }))
        .pipe(rename(config.names.css.prod))
        .pipe(gulp.dest(config.paths.css.dest));
});

gulp.task('build-css-site', () => {
    const less = require('gulp-less');

    return gulp.src(config.paths.site.css.entry)
        .pipe(less())
        .pipe(gulp.dest(config.paths.site.css.dest));
});

gulp.task('build-css', ['build-css-dev', 'build-css-prod', 'build-css-site']);