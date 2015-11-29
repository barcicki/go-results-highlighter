'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('build-pages', () => {
    const jade = require('gulp-jade');

    return gulp.src(config.paths.site.jades.pages)
        .pipe(jade())
        .pipe(gulp.dest(config.paths.site.jades.dest));
});