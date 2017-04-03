var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var merge = require('merge2');
var $ = require('gulp-load-plugins')();

gulp.task('dist', function() {
  var tsProject = $.typescript.createProject('tsconfig-dist.json',{typescript:require('typescript')});
  var tsResult = tsProject.src()
    .pipe($.plumber({ errorHandler: $.notify.onError("<%= error.stack %>") }))
    .pipe($.sourcemaps.init())
    .pipe(tsProject());
  return merge(
    tsResult.js
      .pipe($.typescriptAngular({ moduleName: 'fi.seco.sparql' }))
      .pipe($.sourcemaps.write()),
    tsResult.dts).pipe(gulp.dest('dist'));
});

gulp.task('test-build', function() {
  var tsProject = $.typescript.createProject('tsconfig.json',{typescript:require('typescript')});
  var tsResult = tsProject.src()
    .pipe($.plumber({ errorHandler: $.notify.onError("<%= error.stack %>") }))
    .pipe($.sourcemaps.init())
    .pipe(tsProject());
  return merge(
    tsResult.js
      .pipe($.typescriptAngular({ moduleName: 'fi.seco.sparql' }))
      .pipe($.sourcemaps.write()),
    tsResult.dts).pipe(gulp.dest('.tmp'));
});

gulp.task('clean', function(cb) {
  return require('del')(['dist','.tmp'], cb);
});

gulp.task('test', ['test-build'], function() {
  return merge(gulp.src(mainBowerFiles({includeDev:true})), gulp.src('.tmp/**/*.js'))
    .pipe($.jasmineBrowser.specRunner({console: true}))
    .pipe($.jasmineBrowser.headless({sourcemappedStacktrace: true}));
});

gulp.task('twatch', ['test'], function() {
  $.watch(["src/**/*.ts","spec/**/*.ts"], function() { gulp.start('test'); });
});

gulp.task('btest', function() {
  return merge(gulp.src(mainBowerFiles({includeDev:true})), gulp.src('.tmp/**/*.js'))
    .pipe($.watch('.tmp/**/*.js'))
    .pipe($.jasmineBrowser.specRunner())
    .pipe($.jasmineBrowser.server({port:8888, findOpenPort: true, sourcemappedStacktrace: true}));
});

gulp.task('btwatch', function() {
  $.watch(["src/**/*.ts","spec/**/*.ts"], function() { gulp.start('test-build'); });
  return gulp.start('btest');
});


require('gulp').task('default', function(cb) {
  return require('run-sequence')('clean','build', cb);
});
