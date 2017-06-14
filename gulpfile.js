var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    babili = require("gulp-babili");
    cleanCSS = require('gulp-clean-css'),
    concatCSS = require('gulp-concat-css'),
    sass = require('gulp-sass'),
	htmlmin = require('gulp-htmlmin'),
    browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "dist"
        }
    });
});

gulp.task('bs-reload', function() {
    browserSync.reload();
});

gulp.task('styles', function() {
    gulp.src(['src/scss/**/*.scss'])
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concatCSS("style.css"))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('scripts', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(concat('script.js'))
        .pipe(babili())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task("html", function() {
    return gulp.src("src/*.html")
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task("other-files", function() {
	return gulp.src(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html", "!**/Thumbs.db"], { nodir: true })
	.pipe(gulp.dest("dist"))
	.pipe(browserSync.reload({
		stream: true
	}));
})

gulp.task("build", ["styles", "scripts", "html", "other-files"]);

gulp.task('serve', ['browser-sync'], function() {
    gulp.watch("src/scss/**/*.scss", ['styles']);
    gulp.watch("src/js/**/*.js", ['scripts']);
    gulp.watch("src/*.html", ['html']);
	gulp.watch(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html"], ["other-files"])
});

gulp.task("default", function() {
    console.log(`
            _____       _              _
           / ____|     | |            (_)
          | (___   __ _| |_ __ _ _ __  _  __ _   _ __ ___   ___   ___
           \\___ \\ / _\` | __/ _\` | '_ \\| |/ _\` | | '_ \` _ \\ / _ \\ / _ \\
           ____) | (_| | || (_| | | | | | (_| |_| | | | | | (_) |  __/
          |_____/ \\__,_|\\__\\__,_|_| |_|_|\\__,_(_)_| |_| |_|\\___/ \\___|

 ------------------------------------------------------------------------------

 Avaliable commands:
 serve  - Start a BrowserSync webserver and open it in your browser
          BrowserSync will automagically reload the page for you whenever you
            change something! It's very convenient!

 build  - Builds the website and puts the output in the dist folder
          This command is ran automatically when you run "serve"
          It compresses HTML, CSS and JS and build SASS files
`)
});
