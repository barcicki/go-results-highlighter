'use strict';

const gulp = require('gulp');
const config = require('../config');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
    gulp.src([
        config.paths.js.all,
        config.paths.site.js.all,
        config.paths.tests.all,
        config.paths.tasks.all
    ])
        .pipe(eslint())
        .pipe(eslint.format());
});
