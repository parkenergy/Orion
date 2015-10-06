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
var rimraf = require('gulp-rimraf');
var gulpif = require('gulp-if');
var git = require('gulp-git');
var exit = require('gulp-exit');
var path = require('path');

// used to bundle server side code needed by the client
var runSequence = require('run-sequence');
var browserify = require('browserify');
var vss = require('vinyl-source-stream');

/* TASKS
----------------------------------------------------------------------------- */


/* Sync (git)
----------------------------------------------------------------------------- */
gulp.task('purge', function () {
  gulp.src('./lib/', { read: false })
    .pipe(rimraf({ force: true }))
    .pipe(exit());
});

gulp.task('pull', function() {
  git.pull('origin', 'master', {args: '--rebase -f'}, function (err) {
    if (err) throw err;
  });
});

gulp.task('updateSubmodules', function () {
  git.updateSubmodule({ args: '--init' });
});


/* Packaging
----------------------------------------------------------------------------- */
gulp.task('common-packager', function() {
   return gulp.src('./Common/**/*')
   .pipe(gulp.dest('./lib'));
});


/* Bundling
----------------------------------------------------------------------------- */
gulp.task('browserify', function () {
  return browserify('./lib/_dev_util/browserify/includes.js')
    .bundle()
    .pipe(vss('browserify.js')) // pass output filename to vinyl-source-stream
    .pipe(gulp.dest('public')); // pipe stream to tasks, triggers 'scripts' task
});

gulp.task('less', function () { // compile LESS to CSS
  return gulp.src('./lib/public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('./lib/public/stylesheets'));
});

gulp.task('scripts', function() { // concat & minify js files
  return gulp.src([
      './lib/public/angular/**/*.js',
      './lib/public/scripts/**/*.js',
      './lib/public/bootstrap/bootstrap.min.js',
      './lib/public/browserify.js',
      './public/app/**/*.js',
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'))
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public'));
});


/* LINT
----------------------------------------------------------------------------- */
gulp.task('back-end-lint', function () {
  return gulp.src([
      './lib/controllers/**/*.js',
      './lib/helpers/**/*.js',
      './lib/models/**/*.js',
      './lib/routes/**/*.js',
      './lib/tests/**/*.js',
      './routes/**/*.js',
      './app.js',
      './gulpfile.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('front-end-lint', function() {
  return gulp.src([
    './lib/public/angular/**/*.js',
    './public/app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


/* Testing
----------------------------------------------------------------------------- */
gulp.task('mocha', function () {
  return gulp.src('./lib/tests/mocha/**/*.js', {read: false})
      .pipe(mocha({reporter: 'nyan'}));
});


/* Start
----------------------------------------------------------------------------- */
// launches the server with nodemon
gulp.task('start', ['test'], function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    watch: [
      './Common/**/*',
      './routes/**/*.js',
      './app.js'
    ]})
    .on('restart', 'test')
    .on('exit', ['stop']);
});

/* Watching
----------------------------------------------------------------------------- */

// Watch Local Files For Changes
gulp.task('watch', function() {

  gulp.watch(['./Common/**/*'], ['common-packager']);

  gulp.watch([
    './lib/public/**/*.less',
    './lib/public/angular/**/*.js',
    './public/app/**/*.js',
    './public/scripts/**/*.js'],
    ['scripts']);

  gulp.watch([
    './lib/_dev_util/browserify/includes.js'],
    ['browserify']);

  gulp.watch('./lib/public/browserify.js', ['scripts']);

});


/* Shutdown MongoDB
----------------------------------------------------------------------------- */
var exec = require('child_process').exec;

gulp.task('shutdown-mongodb', function (callback) {
  var cmd = "mongo admin --eval 'db.shutdownServer()' > /dev/null";
  exec(cmd, function (err) { callback(err); });
});


/* DEFAULT TASK
----------------------------------------------------------------------------- */
gulp.task('sync', function (callback) {
  runSequence('updateSubmodules', callback);
});

gulp.task('package', ['sync'], function (callback) {
  runSequence('common-packager', callback);
});

gulp.task('bundle', ['package'], function (callback) {
  runSequence('browserify', 'less', 'scripts', callback);
});

gulp.task('lint', ['bundle'], function (callback) {
  runSequence('back-end-lint', 'front-end-lint', callback);
});

gulp.task('test', ['lint'], function (callback) {
  runSequence('mocha', callback);
});

gulp.task('default', function (callback) {
  runSequence('start', ['watch'], callback);
});

gulp.task('stop', function (callback) {
  runSequence('shutdown-mongodb', callback);
});
