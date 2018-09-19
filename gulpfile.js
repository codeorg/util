const gulp = require('gulp');
const clean = require('gulp-clean');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('clean', function() {
   return gulp.src('dist')
        .pipe(clean())
})

gulp.task('min', function () {
    return gulp.src(['src/lodash.js','src/moment.js','src/co-util.js'])
        .pipe(concat('co-util.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], function(){
    return gulp.start('min');
});
