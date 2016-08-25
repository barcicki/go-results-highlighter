'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('lint', () => {
    const eslint = require('gulp-eslint');

    gulp.src([
        config.paths.js.all,
        config.paths.site.js.all,
        config.paths.tests.all,
        config.paths.tasks.all
    ])
        .pipe(eslint())
        .pipe(eslint.format());
});
