const gulp = require('gulp');
const config = require('../config');

gulp.task('deploy', ['build'], () => {
    const ghPages = require('gulp-gh-pages');

    return gulp.src(config.paths.site.all)
        .pipe(ghPages());
});
