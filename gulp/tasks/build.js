'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('copy-assets', () => {
    return gulp.src(config.paths.site.assets.all)
        .pipe(gulp.dest(config.paths.site.assets.dest));
});

gulp.task('build', ['build-js', 'build-css', 'build-pages', 'copy-assets']);