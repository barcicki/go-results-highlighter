'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('build-pages', () => {
    const jade = require('gulp-jade');
    const replace = require('gulp-replace');

    return gulp.src(config.paths.site.jades.pages)
        .pipe(jade({
            locals: {
                config: config
            }
        }))

        // another dirty hack removing links to MD files
        .pipe(replace(/<p><a href=".+\.md">.+<\/a><\/p>/ig, ''))

        .pipe(gulp.dest(config.paths.site.jades.dest));
});