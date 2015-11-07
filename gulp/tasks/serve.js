'use strict';

const gulp = require('gulp');
const config = require('../config');
const browserSync = require('browser-sync').create();

gulp.task('serve', ['build'], () => {

    browserSync.init({
        server: {
            baseDir: config.paths.dest
        }
    });

    gulp.watch(config.paths.css.all, ['build-css', browserSync.reload]);
    gulp.watch(config.paths.js.all, ['build-js', browserSync.reload]);
    gulp.watch(config.paths.site.css.all, ['build-css', browserSync.reload]);
    gulp.watch(config.paths.site.js.all, ['build-js', browserSync.reload]);
    gulp.watch(config.paths.site.jades.all, ['build-pages', browserSync.reload]);
});