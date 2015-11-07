'use strict';

const gulp = require('gulp');
const config = require('../config');
const jade = require('gulp-jade');

gulp.task('build-pages', () => {
    return gulp.src(config.paths.site.jades.pages)
        .pipe(jade())
        .pipe(gulp.dest(config.paths.site.jades.dest));
});