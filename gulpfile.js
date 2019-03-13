const util = require("util");
const path = require("path");

const SRC = path.join(__dirname, "./src");
const DEST = path.join(__dirname, "./dist");

const JS_DIR = "js/*.js";
const SCSS_DIR = "scss/*.scss";
const HTML_DIR = "*.html";
const ASSETS_DIR = "assets/**/*";
const LOCALES_DIR = "locales/*.json";

const OPTS = {
	cwd: SRC
}

// Polyfill of the future stream.pipeline API
// Can be changed when Node 10.0.0 hits LTS
const pipeline = util.promisify(require("stream.pipeline-shim"));
const gulp = require("gulp");

const gulpif = require("gulp-if")
const sourcemaps = require("gulp-sourcemaps");
const through = require("through2");

const browserSync = require('browser-sync').create();

if (process.argv.includes("--production")) {
	process.env.NODE_ENV = "production";
}

const mode = process.env.NODE_ENV || "development";

function prodOnly(task) {
	return gulpif(
		() => mode === "production",
		task
	)
}

function js() {
	const webpack = require("webpack-stream");
	const babel = require("gulp-babel");
	const uglify = require("gulp-uglify");

	return pipeline(
		gulp.src(JS_DIR, OPTS),
		webpack({
			mode,
			devtool: "source-map",
			output: {
				filename: "script.js"
			}
		}),
		prodOnly(sourcemaps.init({loadMaps: true})),
		prodOnly(through.obj(function (file, enc, cb) {
			// Filter out the sourcemaps since gulp-sourcemaps handles them
			if (!file.path.endsWith(".map")) this.push(file);
			cb();
		})),
		prodOnly(babel({
			presets: ["@babel/env"]
		})),
		prodOnly(uglify()),
		prodOnly(sourcemaps.write(".")),
		gulp.dest(DEST)
	);
}

function css() {
	const sass = require("gulp-sass");
	const csso = require("gulp-csso");
	const concat = require("gulp-concat");
	const postcss = require("gulp-postcss");
	const autoprefixer = require("autoprefixer");

	sass.compiler = require("node-sass");

	return pipeline(
		gulp.src(SCSS_DIR, OPTS),
		sourcemaps.init(),
		sass(),
		concat("style.css"),
		prodOnly(postcss([autoprefixer()])),
		prodOnly(csso()),
		sourcemaps.write("."),
		gulp.dest(DEST),
		browserSync.stream({match: "**/*.css"})
	)
}

function html() {
	const htmlmin = require("gulp-htmlmin");

	return pipeline(
		gulp.src(HTML_DIR, OPTS),
		htmlmin({collapseWhitespace: true}),
		gulp.dest(DEST)
	)
}

function assets() {
	return pipeline(
		gulp.src(ASSETS_DIR, OPTS),
		gulp.dest(DEST)
	);
}

function locales() {
	return pipeline(
		gulp.src(LOCALES_DIR, OPTS),
		gulp.dest(path.join(DEST, "locales"))
	);
}

function clean() {
	const del = require("del");
	return del(DEST);
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.assets = assets;
exports.locales = locales;

const build = gulp.series(
	clean,
	gulp.parallel(js, css, html, assets, locales)
);

exports.build = build;

function serve() {
	browserSync.init({
		server: DEST
	});

	function reload() {
		// We don't return it or else Gulp gets confuzzled
		browserSync.reload();
		return Promise.resolve(); // Instead we return a resolved Promise
	}

	const WATCH_OPTS = {
		cwd: SRC
	};

	gulp.watch(JS_DIR, WATCH_OPTS, gulp.series(js, reload));
	gulp.watch(SCSS_DIR, WATCH_OPTS, css); // We stream css directly into browserSync
	gulp.watch(HTML_DIR, WATCH_OPTS, gulp.series(html, reload));
	gulp.watch(ASSETS_DIR, WATCH_OPTS, gulp.series(assets, reload));
	gulp.watch(LOCALES_DIR, WATCH_OPTS, gulp.series(locales, reload));
}

exports.serve = gulp.series(build, serve);
