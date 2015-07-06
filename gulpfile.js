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
var browserify = require('browserify');
var vss = require('vinyl-source-stream');

/* TASKS
----------------------------------------------------------------------------- */

gulp.task('pull', function(){
  return git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});

gulp.task('updateSubmodules', ['pull'], function (){
  return git.updateSubmodule({ args: '--init' });
});

gulp.task('common-packager', ['updateSubmodules'], function() {
   return gulp.src('./Common/**/*')
   .pipe(gulp.dest('./_common_packaged'));
});


// bundle server side code needed by client
gulp.task('browserify', ['common-packager'], function () {
  return browserify('./_common_packaged/_dev_util/browserify/includes.js')
    .bundle()
    .pipe(vss('browserify.js')) //pass output filename to vinyl-source-stream
    .pipe(gulp.dest('public')); // pipe stream to tasks, triggers 'scripts' task
});

// ensure back-end code conforms to LINT standards
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

// ensure front-end code conforms to LINT standards
gulp.task('front-end-lint', ['browserify'], function() {
  return gulp.src([
    './_common_packaged/public/angular/**/*.js',
    './public/app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint', ['back-end-lint', 'front-end-lint']);

// compile LESS to CSS
gulp.task('less', ['lint'], function() {
  return gulp.src('./_common_packaged/public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('./_common_packaged/public/stylesheets'));
});

// concat & minify js files
gulp.task('scripts', ['less'], function() {
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

gulp.task('mocha', ['scripts'] , function () {
    return gulp.src('./_common_packaged/tests/mocha/**/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

// launches the server with nodemon
gulp.task('launchserver', ['mocha'], function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    tasks: ['mocha'],
    watch: [
      './_common_packaged/controllers/**/*.js',
      './_common_packaged/helpers/**/*.js',
      './_common_packaged/models/**/*.js',
      './_common_packaged/routes/**/*.js',
      './_common_packaged/tests/**/*.js'
    ]})
    .on('restart', 'mocha')
});

gulp.task('common-unpackager', function() {
  console.log("buildForDeployment variable set to " + buildForDeployment);
  console.log(((buildForDeployment)?"Keeping":"Deleting") + " common package");
  gulp.src('./_common_packaged/', { read: false })
    .pipe(gulpif(!buildForDeployment, rimraf({ force: true })))
    .pipe(exit());
});

// Watch Files For Changes
gulp.task('watch', ['launchserver'], function() {

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

gulp.task('default', [
  'common-packager',
  'browserify',
  'lint',
  'mocha',
  'less',
  'watch',
  'launchserver'
]);
