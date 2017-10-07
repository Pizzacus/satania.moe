// Yea I do feel bad about all those dependencies

const gulp = require('gulp'),
	plumber = require('gulp-plumber'), // Prevent pipe breaking caused by errors from gulp plugins
	rename = require('gulp-rename'), // Rename files
	autoprefixer = require('gulp-autoprefixer'), // Prefix CSS
	concat = require('gulp-concat'), // Concatenates files
	babel = require('gulp-babel'), // Make ES6 JS compatible with old browsers
	babili = require("gulp-babili"), // Minify JS
	cleanCSS = require('gulp-clean-css'), // Minify CSS
	concatCSS = require('gulp-concat-css'), // Concatenate all the CSS
	sass = require('gulp-sass'), // Compile SASS to CSS
	htmlmin = require('gulp-htmlmin'), // Minify HTML
	del = require('del'), // Delete some files
	runSequence = require('run-sequence'), // Run a series of dependant gulp tasks in order
	prompt = require("gulp-prompt"), // Make interactive prompts
	ISO6391 = require('iso-639-1'), // List of all the ISO 639-1 codes
	insertLines = require('gulp-insert-lines'), // Insert lines based on regex
	browserSync = require('browser-sync'); // Make a live http server that reloads when you change something, live!

gulp.task('browser-sync', () => {
	browserSync({
		server: {
			baseDir: "dist"
		}
	});
});

gulp.task('bs-reload', () => {
	browserSync.reload();
});

gulp.task('styles', () => {
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

gulp.task('scripts', () => {
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('script.js'))
		.pipe(babel({
            presets: ['env']
        }))
		.pipe(babili())
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task("html", () => {
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

gulp.task("clean", () => {
	return del('dist/**/*');
});

gulp.task("other-files", () => {
	return gulp.src(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html", "!**/Thumbs.db", "!src/img/High Resolution and PSDs/**/*"], {
			nodir: true
		})
		.pipe(gulp.dest("dist"))
		.pipe(browserSync.reload({
			stream: true
		}));
})

gulp.task("build", () => {
	runSequence("clean", ["styles", "scripts", "html", "other-files"]);
});

gulp.task('serve', () => {
	runSequence("build", "browser-sync");

	gulp.watch("src/scss/**/*.scss", ['styles']);
	gulp.watch("src/js/**/*.js", ['scripts']);
	gulp.watch("src/*.html", ['html']);
	gulp.watch(["src/**/*", "!src/scss/**/*.scss", "!src/js/**/*.js", "!src/*.html"], ["other-files"])
});

gulp.task("add-language", () => {

	gulp.src('src/index.html')
		.pipe(prompt.prompt({
			type: "input",
			name: "language",
			message: "\n\nPlease enter the name of the language\n(In English or in the language itself)\n\n>"
		}, res => {
			const languageCode = ISO6391.getCode(res.language);

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

gulp.task("default", () => {
	console.log(`
            _____       _              _
           / ____|     | |            (_)
          | (___   __ _| |_ __ _ _ __  _  __ _   _ __ ___   ___   ___
           \\___ \\ / _\` | __/ _\` | '_ \\| |/ _\` | | '_ \` _ \\ / _ \\ / _ \\
           ____) | (_| | || (_| | | | | | (_| |_| | | | | | (_) |  __/
          |_____/ \\__,_|\\__\\__,_|_| |_|_|\\__,_(_)_| |_| |_|\\___/ \\___|

 ------------------------------------------------------------------------------

 Avaliable commands:

 THERE ARE NO AVAILABLE COMMANDS
 You cannot command the Queen of Hell. The Queen of Hell commands you.
 However, if you would like to ask nicely, the queen has a few suggestions:

 serve        - Start a BrowserSync webserver and open it in your browser
                BrowserSync will automagically reload the page for you whenever you
                  change something! It's very convenient!

 build        - Builds the website and puts the output in the dist folder
                This command is ran automatically when you run "serve"
                It compresses HTML, CSS and JS and build SASS files

 clean        - Deletes the dist folder (it is safe to do that)

 add-language - Prepare the files for a new language automatically!
`)
});
