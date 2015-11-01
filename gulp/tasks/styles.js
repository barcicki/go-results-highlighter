'use strict';

const gulp = require('gulp');
const config = require('../config');
const less = require('gulp-less');
const rename = require('gulp-rename');
const CleanCssPlugin = require('less-plugin-clean-css');
const cleancss = new CleanCssPlugin({ advanced: true });

gulp.task('build-css', () => {
    return gulp.src(config.paths.css.entry)
        .pipe(less({
            plugins: [cleancss]
        }))
        .pipe(rename(config.names.css.dest))
        .pipe(gulp.dest(config.paths.css.dest));
});