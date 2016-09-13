var version = require('./package.json').version,
    gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    flatten = require('gulp-flatten'),
    gulpif = require('gulp-if'),
    csso = require('gulp-csso'),
    del = require('del'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config.js'),
    browserSync = require('browser-sync').create(),
    data = require('gulp-data'),
    nunjucks = require('gulp-nunjucks');

var settings = {
    scsso: {
        comments: false,
        restructure: false
    },
    sass: {
        includePaths: [
            './bower_components/mindy-sass'
        ]
    },
    paths: {
        templates: './templates/**/*.html',
        js: './src/js/**/*.js',
        images: './src/images/**/*{.jpg,.png}',
        fonts: './src/fonts/**/*{.eot,.otf,.woff,.woff2,.ttf,.svg}',
        css: [
            './src/scss/**/*.scss',
            './src/fonts/**/*.css'
        ]
    },
    dst: {
        css: './dist/' + version + '/css',
        images: './dist/' + version + '/images',
        js: './dist/' + version + '/js',
        fonts: './dist/' + version + '/fonts',
        templates: './dist/' + version + '/templates'
    }
};

gulp.task('js', function () {
    return gulp.src(settings.paths.js)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(settings.dst.js));
});

gulp.task('fonts', function () {
    gulp.src(settings.paths.fonts)
        .pipe(flatten())
        .pipe(gulp.dest(settings.dst.fonts));
});

gulp.task('images', function () {
    gulp.src(settings.paths.images)
        .pipe(gulp.dest(settings.dst.images));
});

gulp.task('css', function () {
    return gulp.src(settings.paths.css)
        .pipe(sass(settings.sass).on('error', sass.logError))
        .pipe(gulpif(settings.DEBUG, sourcemaps.init()))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(concat('bundle.css'))
        .pipe(csso(settings.scsso))
        .pipe(gulpif(settings.DEBUG, sourcemaps.write('.')))
        .pipe(gulp.dest(settings.dst.css))
        .pipe(browserSync.stream());
});

gulp.task('watch', function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            // TODO
            baseDir: "./dist/"
        }
    });

    gulp.watch(settings.paths.templates, ['templates']).on('change', browserSync.reload);
    gulp.watch(settings.paths.js, ['js']).on('change', browserSync.reload);
    gulp.watch(settings.paths.css, ['css']).on('change', browserSync.reload);
});

gulp.task('clean', function () {
    return del('dist/' + version);
});

gulp.task('default', ['clean'], function () {
    return gulp.start('css', 'images', 'fonts', 'templates', 'js');
});

gulp.task('templates', function () {
    return gulp.src(settings.paths.templates)
        .pipe(data(function (file) {
            var dataPath = './templates/' + path.basename(file.path) + '.json';
            return path.existsSync(dataPath) ? require(dataPath) : {};
        }))
        .pipe(nunjucks.compile())
        .pipe(gulp.dest('./example/dist'));
});
