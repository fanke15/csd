const gulp = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-mod-function');
const cssnano = require('cssnano');
const easyimport = require('postcss-easy-import');

function serve() {
  livereload.listen();
}

function handleError(done) {
  return function (err) {
    if (err) {
      beeper();
    }
    done(err);
  };
}

function hbs() {
  return gulp.src(['*.hbs', 'partials/**/*.hbs'])
    .pipe(livereload());
}

function css() {
  return gulp.src('assets/css/*.css', { sourcemaps: true })
    .pipe(postcss([easyimport, colorFunction(), autoprefixer(), cssnano()]))
    .pipe(gulp.dest('assets/built/', { sourcemaps: '.' }))
    .pipe(livereload());
}

function js() {
  return gulp.src(['assets/js/lib/*.js', 'assets/js/*.js'], { sourcemaps: true })
    .pipe(concat('casper.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/built/', { sourcemaps: '.' }))
    .pipe(livereload());
}

function zipper() {
  const filename = require('./package.json').name + '.zip';

  return gulp.src([
      '**',
      '!node_modules',
      '!node_modules/**',
      '!dist',
      '!dist/**',
      '!yarn-error.log',
      '!yarn.lock',
      '!gulpfile.js',
    ])
    .pipe(zip(filename))
    .pipe(gulp.dest('dist/'));
}

function watchFiles() {
  gulp.watch('assets/css/**', css);
  gulp.watch('assets/js/**', js);
  gulp.watch(['*.hbs', 'partials/**/*.hbs'], hbs);
}

const build = gulp.series(css, js);
const dev = gulp.series(build, gulp.parallel(serve, watchFiles));
const zipTask = gulp.series(build, zipper);

exports.build = build;
exports.zip = zipTask;
exports.default = dev;