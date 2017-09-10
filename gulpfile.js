'use strict'
require('dotenv').config();
const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');

const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const include = require('gulp-include');

//install eslint

const sourceRoot = 'src/*'

const esSource = 'src/javascripts/main.js';
const sassSource = 'src/stylesheets/*.scss';
const sassWatch = 'src/stylesheets/**/*.scss';

const imgSource = 'src/images/**/*';
const miscMediaSource = 'src/media/**/*';
const esWatch = 'src/javascripts/**/*.js';

const distRoot = 'public/'
const jsDist = 'public/javascripts';
const cssDist = 'public/stylesheets';
const imgDist = 'public/images';
const miscMediaDist = 'public/media';


gulp.task('babel', () => {
    if  (process.env.DEBUG){
        return gulp.src(esSource)
            .pipe(include())
            .on('error', swallowError)
            .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['es2015']
            }))
            .on('error', swallowError)
            .pipe(concat('scripts.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(jsDist));
    } // Else
    return gulp.src(esSource)
        .pipe(include())
        .on('error', swallowError)
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', swallowError)
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDist));
});

gulp.task('sass', () => {
    return gulp.src(sassSource)
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', sass.logError)
        .pipe(autoprefixer())
        .on('error', swallowError)
        .pipe(minifyCSS({
            processImport: true
        }))
        .on('error', swallowError)
        .pipe(gulp.dest(cssDist));
});

gulp.task('images', () =>
    gulp.src(imgSource)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDist))
        .on('error', swallowError)
);

gulp.task('media', () => {
    gulp.src(miscMediaSource)
        .pipe(gulp.dest(miscMediaDist));
});

gulp.task('default', () => {
    gulp.start(['babel', 'sass', 'images', 'media', 'other']);
});

gulp.task('watch', () => {
    gulp.watch(esWatch, ['babel'])
    gulp.watch(sassWatch, ['sass'])
    gulp.watch(imgSource, ['images'])
    gulp.watch(miscMediaSource, ['media']);
    gulp.watch(sourceRoot, ['other']);
});

gulp.task('other', () => {
    gulp.src(sourceRoot)
        .pipe(gulp.dest(distRoot));
});

function swallowError (error) {
  // If you want details of the error in the console
  console.log(error.toString())
  this.emit('end')
}