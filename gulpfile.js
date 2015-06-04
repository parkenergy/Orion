/* INCLUDES
----------------------------------------------------------------------------- */

// Include gulp
var gulp = require('gulp');

// Include Gulp Plugins
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');
var path = require('path');

// used to bundle server side code needed by the client
var browserify = require('browserify');
var vss = require('vinyl-source-stream');


/* TASKS
----------------------------------------------------------------------------- */
// bundle server side code needed by client
gulp.task('browserify', function () {
  return browserify('./Common/_dev_util/browserify/includes.js')
    .bundle()
    .pipe(vss('browserify.js')) //pass output filename to vinyl-source-stream
    .pipe(gulp.dest('public')); // pipe stream to tasks, triggers 'scripts' task
});

// ensure back-end code conforms to LINT standards
gulp.task('back-end-lint', function () {
    return gulp.src([
        './Common/controllers/**/*.js',
        './Common/helpers/**/*.js',
        './Common/models/**/*.js',
        './Common/routes/**/*.js',
        './Common/tests/**/*.js',
        './routes/**/*.js',
        './app.js',
        './gulpfile.js'
      ])
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

// ensure front-end code conforms to LINT standards
gulp.task('front-end-lint', ['browserify'], function() {
  return gulp.src([
    './Common/public/angular/**/*.js',
    './public/app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint', ['back-end-lint', 'front-end-lint']);

// compile LESS to CSS
gulp.task('less', ['lint'], function() {
  return gulp.src('./Common/public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('./Common/public/stylesheets'));
});

// concat & minify js files
gulp.task('scripts', ['less'], function() {
  return gulp.src([
      './Common/public/angular/**/*.js',
      './Common/public/scripts/**/*.js',
      './Common/public/bootstrap/bootstrap.min.js',
      './Common/public/browserify.js',
      './public/app/**/*.js',
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'))
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public'));
});

gulp.task('mocha', ['scripts'] , function () {
    return gulp.src('./Common/tests/mocha/**/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

// launches the server with nodemon
gulp.task('launchserver', ['mocha'], function () {
  nodemon({
    script: 'app.js',
    ext: 'html js',
    tasks: ['back-end-lint'],
    ignore: [
      './public/*',
      './Common/public/*',
      './Common/_dev_util/browserify/*']})
    .on('restart', function () {
      console.log('\n\nChange detected, nodemon restarted the server.\n\n');
    })
})

// Watch Files For Changes
gulp.task('watch', ['launchserver'], function() {

  gulp.watch([
    './Common/public/angular/**/*.js',
    './public/app/**/*.js',
    './public/scripts/**/*.js'],
    [ 'front-end-lint', 'scripts' ]);

  gulp.watch('./Common/public/**/*.less', ['less']);

  gulp.watch([
    './Common/helpers/**/*.js',
    './Common/_dev_util/browserify/includes.js'],
    ['browserify']);

  gulp.watch('./Common/public/browserify.js', ['scripts']);

});


/* DEFAULT TASK
----------------------------------------------------------------------------- */

gulp.task('default', [
  'browserify',
  'lint',
  'mocha',
  'less',
  'watch',
  'launchserver'
]);
