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
var gitWatch = require('gulp-git-watch');
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
gulp.task('start', ['test'], function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    watch: [
      './git/ORIG_HEAD',
      './Common/**/*',
      './routes/**/*.js',
      './app.js'
    ]})
    .on('restart', 'test');
});

/* Watching
----------------------------------------------------------------------------- */

// Watch Local Files For Changes
gulp.task('watch', function() {

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

// Watch Remote Git Hash for Changes
gulp.task('git-watch', function() {
  gitWatch({
    gitPull: ['git', 'pull', 'origin', 'master'],
    poll: 5*1000,
    forceHead: true
  })
    .on('check', function () {
      console.log('check git for updates', new Date().toLocaleTimeString());
    })
    .on('nochange', function (hash) {
      console.log('No change:', hash, '\n');
    })
    .on('change', function(newHash, oldHash) {
      console.log('Changed:', oldHash, '->', newHash, '\n');
    });
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

gulp.task('package', function (callback) {
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
  runSequence('start', 'watch', callback);
});

gulp.task('stop', function (callback) {
  runSequence('shutdown-mongodb', callback);
});
