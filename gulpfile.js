var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	babili = require("gulp-babili"),
	cleanCSS = require('gulp-clean-css'),
	concatCSS = require('gulp-concat-css'),
	sass = require('gulp-sass'),
	htmlmin = require('gulp-htmlmin'),
	del = require('del'),
	runSequence = require('run-sequence'),
	prompt = require("gulp-prompt"),
	ISO6391 = require('iso-639-1'),
	insertLines = require('gulp-insert-lines'),
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

gulp.task("clean", function() {
	return del('dist/**/*');
});

gulp.task("other-files", function() {
	return gulp.src(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html", "!**/Thumbs.db", "!src/img/High Resolution and PSDs/**/*"], {
			nodir: true
		})
		.pipe(gulp.dest("dist"))
		.pipe(browserSync.reload({
			stream: true
		}));
})

gulp.task("build", function() {
	runSequence("clean", ["styles", "scripts", "html", "other-files"]);
});

gulp.task('serve', function() {
	runSequence("build", "browser-sync");

	gulp.watch("src/scss/**/*.scss", ['styles']);
	gulp.watch("src/js/**/*.js", ['scripts']);
	gulp.watch("src/*.html", ['html']);
	gulp.watch(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html"], ["other-files"])
});

gulp.task("add-language", function() {

	gulp.src('src/index.html')
		.pipe(prompt.prompt({
			type: "input",
			name: "language",
			message: "\n\nPlease enter the name of the language\n(In English or in the language itself)\n\n>"
		}, function(res) {
			var languageCode = ISO6391.getCode(res.language);

			if (languageCode) {
				console.log("\nLanguage name seems valid!\n\n" + languageCode + ": " + ISO6391.getName(languageCode) + " // " + ISO6391.getNativeName(languageCode));

				gulp.src('src/index.html')
					.pipe(insertLines({
						'after': /<option\s*value="default"\s*>English<\/option>/,
						'lineAfter': '					<option disabled value="' + languageCode + '">' + ISO6391.getNativeName(languageCode) + '</option>'
					}))
					.pipe(gulp.dest("src"));

				gulp.src('src/locale/default.json')
					.pipe(rename(languageCode + ".json"))
					.pipe(gulp.dest("src/locale"));

				console.log("\nLanguage added!\n\nYou can now edit the \"" + languageCode + ".json\" file to edit the translation.\nRun \"gulp serve\" to launch the website in your browser!")
			} else {
				console.log("\nLanguage name isn't valid, please try again...")
			}
		}));
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
