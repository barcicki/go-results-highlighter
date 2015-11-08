const gulp = require('gulp');
const config = require('../config');
const ghPages = require('gulp-gh-pages');

gulp.task('deploy', ['build'], () => {
    return gulp.src(config.paths.site.all)
        .pipe(ghPages());
});
