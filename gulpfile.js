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
var path = require('path');

// used to bundle server side code needed by the client
var browserify = require('browserify');
var vss = require('vinyl-source-stream');

// used by gulp to load the server
var child = require('child_process');
var fs = require('fs');


/* TASKS
----------------------------------------------------------------------------- */

// bundle server side code needed by client
gulp.task('browserify', function () {
  return browserify('./_dev_util/browserify/includes.js')
    .bundle()
    .pipe(vss('browserify.js')) //pass output filename to vinyl-source-stream
    .pipe(gulp.dest('public')); // pipe stream to tasks, triggers 'scripts' task
});

// ensure back-end code conforms to LINT standards
gulp.task('back-end-lint', function () {
    return gulp.src([
      // TODO: fix regex
        './routes/**/*.js',
        './models/**/*.js',
      ])
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

// ensure front-end code conforms to LINT standards
gulp.task('front-end-lint', function() {
  return gulp.src([
    // TODO: fix regex
      './public/app/**/*.js',
      './public/app/apps/**/*.js',
      './public/app/apps/**/**/*.js',
      './public/app/apps/**/**/**/*.js',
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint', ['back-end-lint', 'front-end-lint']);

// compile LESS to CSS
gulp.task('less', function() {
  return gulp.src('./public/stylesheets/site.less')
    .pipe(less())
    .pipe(gulp.dest('public/stylesheets'));
});

// concat & minify js files
gulp.task('scripts', function() {
  return gulp.src([
      './public/app/**/*.js',
      './public/scripts/**/*.js',
      './public/bootstrap/bootstrap.min.js',
      './public/browserify.js'
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'))
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public'));
});

// launches the server with nodemon
gulp.task('launchserver', function () {
  nodemon({ script: 'app.js', ext: 'html js', tasks: ['back-end-lint'] })
    .on('restart', function () {
      console.log('nodemon restarted the server!')
    })
})

// Watch Files For Changes
gulp.task('watch', function() {

  gulp.watch( ['./public/app/**/*.js', './public/scripts/**/*.js'],
              [ 'lint', 'scripts' ]);

  gulp.watch('public/**/*.less', ['less']);

  gulp.watch('./helpers/**/*.js', ['browserify']);

  gulp.watch('./public/browserify.js', ['scripts']);

});


/* DEFAULT TASK
----------------------------------------------------------------------------- */

gulp.task('default', [
  'browserify',
  'lint',
  'less',
  'watch',
  'launchserver'
]);
