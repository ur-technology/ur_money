var gulp = require('gulp'),
  gulpWatch = require('gulp-watch'),
  del = require('del'),
  runSequence = require('run-sequence'),
  sh = require('shelljs'),
  argv = process.argv;


/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);
gulp.task('upload:before', ['baseBuild']);
gulp.task('upload:after', ['copyGo']);


// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');

var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function (done) {
  runSequence(
    ['sass', 'html', 'fonts', 'scripts'],
    function () {
      gulpWatch('app/**/*.scss', function () { gulp.start('sass'); });
      gulpWatch('app/**/*.html', function () { gulp.start('html'); });
      buildBrowserify({ watch: true }).on('end', done);
    }
  );
});


gulp.task('build', function (done) {
  runSequence('baseBuild', 'copyGo', done);
});

gulp.task('baseBuild', ['clean'], function (done) {
  runSequence(
    ['sass', 'html', 'fonts', 'scripts'],
    function () {
      buildBrowserify({
        minify: isRelease,
        browserifyOptions: {
          debug: !isRelease
        },
        uglifyOptions: {
          mangle: false
        }
      }).on('end', done);
    }
  );
});

gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);
gulp.task('scripts', copyScripts);
gulp.task('clean', ['cleanGo'], function () {
  return del('www/build');
});




gulp.task('cleanGo', function () {
  return del('www/go');
});

gulp.task('copyGo', ['cleanGo'], function (done) {
  gulp.src(['www/**/*']).pipe(gulp.dest('www/go')).on('end', done);

});

gulp.task('upload', ['cleanGo'], function (done) {
  sh.exec('ionic upload', { async: false }, done);
});

gulp.task('plugins', function (done) {
  var plugins = require('./package.json').cordovaPlugins,
    count = plugins.length;

  plugins.forEach(function (plugin) {
    if (typeof (plugin) === 'object') {
      sh.exec('cordova plugin add ' + plugin.locator, { async: false });
    } else {
      sh.exec('cordova plugin add ' + plugin, { async: false });
    }
    count--;
  });

  if (count === 0) {
    done();
  }
});
