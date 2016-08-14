'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('serve', ['build'], (done) => {
    const browserSync = require('browser-sync');

    browserSync.init({
        server: {
            baseDir: config.paths.dest
        }
    }, done);
});

gulp.task('serve-watch', ['serve'], () => {
    const browserSync = require('browser-sync');

    gulp.watch(config.paths.css.all, ['build-css', browserSync.reload]);
    gulp.watch(config.paths.js.all, ['build-js', browserSync.reload]);
    gulp.watch(config.paths.site.css.all, ['build-css', browserSync.reload]);
    gulp.watch(config.paths.site.js.all, ['build-js', browserSync.reload]);
    gulp.watch(config.paths.site.jades.all, ['build-pages', browserSync.reload]);
    gulp.watch(config.paths.site.resources.all, ['build-pages', browserSync.reload]);
});

gulp.task('watch', ['build'], () => {
    gulp.watch(config.paths.css.all, ['build-css']);
    gulp.watch(config.paths.js.all, ['build-js']);
    gulp.watch(config.paths.site.css.all, ['build-css']);
    gulp.watch(config.paths.site.js.all, ['build-js']);
    gulp.watch([config.paths.site.jades.all, config.paths.js.bookmark], ['build-pages']);
    gulp.watch(config.paths.site.resources.all, ['build-pages']);
});