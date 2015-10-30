'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('watch', () => {
    gulp.watch(config.paths.css.all, ['build-css']);
    gulp.watch(config.paths.js.all, ['build-js']);
});