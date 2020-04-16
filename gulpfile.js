'use strict';

const del = require('del');
const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
const browserify = require('browserify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const browserSync = require('browser-sync').create();

function doWatchify() {
    let customOpts = {
        entries: 'src/index.js',
        debug: true,
        standalone: 'Reche',
        transform: ['babelify', 'browserify-versionify'],
        plugin: ['browserify-derequire']
    };

    let opts = Object.assign({}, watchify.args, customOpts);
    let b = watchify(browserify(opts));

    b.on('update', function () {
        return doBundle(b).on('end', browserSync.reload.bind(browserSync));
    });
    b.on('log', console.log.bind(console));

    return b;
}

function doBundle(b) {
    return b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source('reche.js'))
        .pipe(buffer())

        .pipe(uglify({
            mangle: false,//类型：Boolean 默认：true 是否修改变量名
            //删除注释
            output: {
                comments: false
            },
            compress: true
        }))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
}

gulp.task('watch', function () {
    let gulpWatcher = gulp.watch(['gulpfile.js', 'src/**/*.js']);

    gulpWatcher.on('change', function (e) {
        if (e.type === 'changed' || e.type === 'added') {
            //return doLint(e.path, false);
        }
    });

    return doBundle(doWatchify()).on('end', function () {
        browserSync.init({
            server: {
                baseDir: './'
            },
            port: 8000,
            open: false
        });
        require('opn')('http://localhost:8000/demo/index.html');
    });
});


gulp.task('build', function () {
    let b = browserify({
        entries: 'src/index.js',
        debug: true,
        standalone: 'Reche',
        transform: ['babelify', 'browserify-versionify'],
        plugin: ['browserify-derequire']
    });

    return doBundle(b);
});

gulp.task('minimize', gulp.series( 'build'), function () {
    let options =  {
        mangle: false,//类型：Boolean 默认：true 是否修改变量名
        //删除注释
        output: {
            comments: false
        },
        compress: true
    };


    return gulp.src('dist/reche.js')
        .pipe(rename({extname: '.min.js'}))
        .pipe(uglify(options))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('default', gulp.series('build'));
gulp.task('release', gulp.series('build', 'minimize'));