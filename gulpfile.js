// Invoke 'strict' JavaScript mode
'use strict';

// Load the plugins
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

var concat      = require('gulp-concat'),
    sass        = require('gulp-sass'),
    uglify      = require('gulp-uglify'),
    livereload  = require('gulp-livereload');
var spawn       = require('child_process').spawn;
var node;

// Task for linting js files
gulp.task('js', function() {
  return gulp.src([
      'server.js',
      'app/**/*.js',
      'config/*.js',
      'config/**/*.js'])
    // .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('scss',function(){
  return gulp.src([
      //'./src/js/vendors/angular-material/angular-material.scss',
      './src/css/*.scss'
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest("./public"))
    .pipe(livereload());
});

gulp.task('css',function(){
  return gulp.src([
       './src/js/vendors/bootstrap/dist/css/bootstrap.css',
       './src/js/vendors/angular-material/angular-material.min.css'
       ])
      .pipe(concat('vendors.css'))
      .pipe(gulp.dest("./public"))
      .pipe(livereload());
});

gulp.task('js_vendor', function () {
  return gulp.src([
      './src/js/vendors/angular/angular.js',
      './src/js/vendors/angular-base64/angular-base64.js',
      './src/js/vendors/forge-bower/dist/forge.bundle.js',
      './src/js/vendors/angular-route/angular-route.js',
      './src/js/vendors/angular-resource/angular-resource.js',
      './src/js/vendors/ng-file-upload/ng-file-upload-all.min.js',
      './src/js/vendors/ng-file-upload-shim/ng-file-upload-all.min.js',
      './src/js/vendors/angular-aria/angular-aria.js',
      './src/js/vendors/angular-material/angular-material.js',
      './src/js/vendors/angular-animate/angular-animate.min.js',
      // boottrap
      './src/js/vendors/jquery/dist/jquery.min.js',
      './src/js/vendors/bootstrap/dist/js/bootstrap.min.js',
      // ui-bootstrap-paginator
      './src/js/vendors/angular-bootstrap/ui-bootstrap-tpls.min.js',
      './src/js/vendors/moment/min/moment.min.js'
    ])
    //.pipe(uglify())
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest("./public"))
    .pipe(livereload());
});
gulp.task('js_angular', function () {
  return gulp.src([
      './src/js/statics/application.js',
      './src/js/statics/**/*.js',
      './src/js/statics/**/**/*.js'
    ])
    //.pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest("./public"))
    .pipe(livereload());
    //supervisor
    //node inspector
});
gulp.task('angular_template', function () {
  return gulp.src([
      './public/**/views/*.html'
    ])
    .pipe(livereload());
});

// Watch for changes
gulp.task('watch', function() {
  livereload.listen();
  // watch js files and run lint and run js and angular tasks
  gulp.watch([
      'server.js',
      'app/*/*.js',
      'config/*.js',
      'config/*/*.js'
    ], ['js']);

  gulp.watch('./src/css/*.scss',['scss']);
  gulp.watch([
    './src/js/statics/*.js',
    './src/js/statics/*/*.js',
    './src/js/statics/*/*/*.js'
  ], ['js_angular']);
  gulp.watch('./public/**/views/*.html',['angular_template']);
});

// The nodemon task
gulp.task('nodemon', function() {
  /*nodemon({
    script: 'server.js',
    ext: 'js html'
  })
    .on('start', ['watch'])
    .on('change', ['watch'])
    .on('restart', function() {
      console.log('Restarted!');
    });*/
});


gulp.task('default', function() {
  gulp.run('server');
});
gulp.task('server', function() {
  if (node)
    node.kill();
  node = spawn('node', ['server.js'], {
    stdio: 'inherit'
  });
  gulp.src([
      './server.js',
      './app/**/*.js',
      './config/*.js',
      './config/**/*.js',
      './src/js/statics/*.js',
      './src/js/statics/*/*.js',
      './src/js/statics/*/*/*.js'])
    // .pipe(jshint())
    .pipe(jshint.reporter('default'));

  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});
process.on('exit', function() {
  if(node) node.kill();
});

// Defining the main gulp task
gulp.task('default', ['scss','css','js_vendor','js_angular','watch','server']);
