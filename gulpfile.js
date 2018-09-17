const gulp = require('gulp');
const clean = require('gulp-clean');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('clean', function() {
    gulp.src('dest/*')
        .pipe(clean())
})

gulp.task('min', function () {
    gulp.src(['src/lodash.js','src/moment.js','src/co-util.js'])
        .pipe(concat('co-util.js'))
        .pipe(minify())
        .pipe(gulp.dest('dest'));
});

gulp.task('default', ['clean'], function(){
    gulp.start('min');
});
