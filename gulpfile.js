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
  gulp.src('./_common_packaged/', { read: false })
    .pipe(rimraf({ force: true }))
    .pipe(exit());
});

gulp.task('pull', function(){
  git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});

gulp.task('updateSubmodules', function (){
  return git.updateSubmodule({ args: '--init' });
});


/* Packaging
----------------------------------------------------------------------------- */
gulp.task('common-packager', function() {
   return gulp.src('./Common/**/*')
   .pipe(gulp.dest('./_common_packaged'));
});


/* Bundling
----------------------------------------------------------------------------- */
gulp.task('browserify', function () {
  return browserify('./_common_packaged/_dev_util/browserify/includes.js')
    .bundle()
    .pipe(vss('browserify.js')) // pass output filename to vinyl-source-stream
    .pipe(gulp.dest('public')); // pipe stream to tasks, triggers 'scripts' task
});

gulp.task('less', function () { // compile LESS to CSS
  return gulp.src('./_common_packaged/public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('./_common_packaged/public/stylesheets'));
});

gulp.task('scripts', function() { // concat & minify js files
  return gulp.src([
      './_common_packaged/public/angular/**/*.js',
      './_common_packaged/public/scripts/**/*.js',
      './_common_packaged/public/bootstrap/bootstrap.min.js',
      './_common_packaged/public/browserify.js',
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
      './_common_packaged/controllers/**/*.js',
      './_common_packaged/helpers/**/*.js',
      './_common_packaged/models/**/*.js',
      './_common_packaged/routes/**/*.js',
      './_common_packaged/tests/**/*.js',
      './routes/**/*.js',
      './app.js',
      './gulpfile.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('front-end-lint', function() {
  return gulp.src([
    './_common_packaged/public/angular/**/*.js',
    './public/app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


/* Testing
----------------------------------------------------------------------------- */
gulp.task('mocha', function () {
  return gulp.src('./_common_packaged/tests/mocha/**/*.js', {read: false})
      .pipe(mocha({reporter: 'nyan'}));
});


/* Start
----------------------------------------------------------------------------- */
// launches the server with nodemon
gulp.task('launch-server', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    watch: [
      './_common_packaged/controllers/**/*.js',
      './_common_packaged/helpers/**/*.js',
      './_common_packaged/models/**/*.js',
      './_common_packaged/routes/**/*.js',
      './_common_packaged/tests/**/*.js'
    ]})
    .on('restart', 'test')
});

gulp.task('common-unpackager', function() {
  console.log("buildForDeployment variable set to " + buildForDeployment);
  console.log(((buildForDeployment)?"Keeping":"Deleting") + " common package");
  gulp.src('./_common_packaged/', { read: false })
    .pipe(gulpif(!buildForDeployment, rimraf({ force: true })))
    .pipe(exit());
});

// Watch Files For Changes
gulp.task('watch', ['start'], function() {

  gulp.watch(['./Common/**/*'], ['common-packager']);

  gulp.watch([
    './_common_packaged/public/**/*.less',
    './_common_packaged/public/angular/**/*.js',
    './public/app/**/*.js',
    './public/scripts/**/*.js'],
    ['scripts']);

  gulp.watch([
    './_common_packaged/_dev_util/browserify/includes.js'],
    ['browserify']);

  gulp.watch('./_common_packaged/public/browserify.js', ['scripts']);

});


/* DEFAULT TASK
----------------------------------------------------------------------------- */
gulp.task('package', ['common-packager']);

gulp.task('bundle', ['package'], function (callback) {
  runSequence('browserify', 'less', 'scripts', callback);
});

gulp.task('lint', ['bundle'], function (callback) {
  runSequence('back-end-lint', 'front-end-lint', callback);
});

gulp.task('test', ['lint'], function (callback) {
  runSequence('mocha', callback);
});

gulp.task('start', ['test', 'launch-server']);

gulp.task('default', [
  'start',
  'watch'
]);

/* CLIENT TASK
----------------------------------------------------------------------------- */
gulp.task('sync', function () {
  runSequence('purge', 'pull', 'updateSubmodules', callback);
});

gulp.task('client', ['sync', 'start']);
