'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('build-js-dev', () => {
    const path = require('path');
    const exorcist = require('exorcist');
    const browserify = require('browserify');
    const through = require('through');
    const source = require('vinyl-source-stream');
    const transform = require('vinyl-transform');

    // dirty hack replacing export default with module.exports
    // due to the change in babel resulting with no possiblity to export
    // default properties without omitting default property
    function removeDefaultPropertyTransform() {
        return through(function (data) {
            this.queue(data.toString().replace(`export default ${config.name};`, `module.exports = ${config.name};`));
        }, function () {
            this.queue(null);
        });
    }

    return browserify(config.paths.js.entry, {
            debug: true,
            standalone: config.name
        })
        .transform(removeDefaultPropertyTransform)
        .transform('babelify')
        .bundle()
        .pipe(source(config.names.js.dest))
        .pipe(transform(() => exorcist(path.join(config.paths.js.dest, config.names.js.map), null, config.package, '.')))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js-site', () => {
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');

    return browserify(config.paths.site.js.entry, {
            debug: true,
        })
        .transform('babelify')
        .bundle()
        .pipe(source(config.paths.site.js.entry))
        .pipe(gulp.dest(config.paths.site.js.dest));
});

gulp.task('build-js-bookmark', () => {
    const browserify = require('browserify');
    const source = require('vinyl-source-stream');
    const buffer = require('vinyl-buffer');
    const uglify = require('gulp-uglify');

    return browserify(config.paths.js.bookmark)
        .transform('node-lessify')
        .transform('babelify')
        .bundle()
        .pipe(source(config.names.js.bookmarkDest))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js-prod', ['build-js-dev'], () => {
    const path = require('path');
    const uglify = require('gulp-uglify');
    const rename = require('gulp-rename');

    return gulp.src(path.resolve(config.paths.js.dest, config.names.js.dest))
        .pipe(uglify())
        .pipe(rename(config.names.js.prod))
        .pipe(gulp.dest(config.paths.js.dest));
});

gulp.task('build-js', ['build-js-dev', 'build-js-prod', 'build-js-bookmark', 'build-js-site']);