/* INCLUDES
 ----------------------------------------------------------------------------- */

// Include gulp
const gulp = require('gulp');

// Include Gulp Plugins
const less = require('gulp-less'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify-es').default,
  nodemon = require('gulp-nodemon'),
  strip = require('gulp-strip-comments');

const path = require('path');

// used to bundle server side code needed by the client
const runSequence = require('run-sequence');

/* TASKS
 ----------------------------------------------------------------------------- */


/* Sync (git)
 ----------------------------------------------------------------------------- */
/*
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

*/

/* Packaging
 ----------------------------------------------------------------------------- */
/*gulp.task('model-packager', function() {
  return gulp.src('./models/!**!/!*')
    .pipe(strip())
    .pipe(uglify({
      ecma: 7,
      compress: {
        warnings: false,
        inline: 3,
        keep_classnames: true,
        keep_fnames: true
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      }
    }))
    .pipe(gulp.dest('./lib/models'));
});*/


/* Bundling
 ----------------------------------------------------------------------------- */


gulp.task('less', function () { // compile LESS to CSS
  return gulp.src('./lib/public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('./lib/public/stylesheets'));
});

gulp.task('scripts', function() { // concat js files
  return gulp.src([
    './lib/public/angular/**/*.js',
    './lib/public/scripts/**/*.js',
    './lib/public/bootstrap/bootstrap.min.js',
    './public/app/**/*.js'
  ])
    .pipe(strip())
    .pipe(uglify({
      ecma: 7,
      compress: {
        warnings: false,
        inline: 3,
        keep_classnames: true,
        keep_fnames: true
      },
      mangle: false,
    }))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'));
});


/* LINT
 ----------------------------------------------------------------------------- */
/*gulp.task('back-end-lint', function () {
  return gulp.src([
    './lib/controllers/!**!/!*.js',
    './lib/helpers/!**!/!*.js',
    './lib/models/!**!/!*.js',
    './lib/routes/!**!/!*.js',
    './lib/tests/!**!/!*.js',
    './routes/!**!/!*.js',
    './app.js',
    './gulpfile.js'
  ])
    .pipe(jshint({ esnext: true }))
    .pipe(jshint({esnext: true}))
    .pipe(jshint.reporter('default'));
});

gulp.task('front-end-lint', function() {
  return gulp.src([
    './lib/public/angular/!**!/!*.js',
    './public/app/!**!/!*.js'
  ])
    .pipe(jshint({ esnext: true }))
    .pipe(jshint({esnext: true}))
    .pipe(jshint.reporter('default'));
});*/


/* Testing
 ----------------------------------------------------------------------------- */



/* Start
 ----------------------------------------------------------------------------- */
// launches the server with nodemon
gulp.task('start', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    watch: [
      './public/bundle.js',
      './public/lib/**/*.js',
      './app.js'
    ]})
      .on('restart');
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
    ['less','scripts']);

});

// Watch Remote Git Hash for Changes
/*gulp.task('git-watch', function() {
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
});*/

/* Shutdown MongoDB
 ----------------------------------------------------------------------------- */
const exec = require('child_process').exec;

gulp.task('shutdown-mongodb', function (callback) {
  const cmd = "mongo admin --eval 'db.shutdownServer()' > /dev/null";
  exec(cmd, function (err) { callback(err); });
});

/* DEFAULT TASK
 ----------------------------------------------------------------------------- */
// gulp.task('sync', function (callback) {
//   runSequence('updateSubmodules', callback);
// });
//
/*
gulp.task('package', function (callback) {
  runSequence('model-packager', callback);
});
*/

gulp.task('bundle', function (callback) {
  runSequence('less', 'scripts', callback);
});

gulp.task('default', function (callback) {
  runSequence('bundle', 'start', 'watch', callback);
});
