var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('build', function() {
  var tsProject = $.typescript.createProject('tsconfig.json',{typescript:require('typescript')});
  var tsResult = tsProject.src()
    .pipe($.plumber({ errorHandler: $.notify.onError("<%= error.stack %>") }))
    .pipe($.sourcemaps.init())
    .pipe(tsProject());
  return require('merge2')(
    tsResult.js
      .pipe($.typescriptAngular({ moduleName: 'fi.seco.sparql' }))
      .pipe($.sourcemaps.write('.')),
    tsResult.dts).pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], function() {
  $.watch("src/**/*.ts", function() { gulp.start('build'); });
});

gulp.task('clean', function(cb) {
  return require('del')(['dist'], cb);
});

require('gulp').task('default', function(cb) {
  return require('run-sequence')('clean','build', cb);
});
