const util = require("util");
const path = require("path");

const SRC_DIR_NAME = "src";
const SRC = `./${SRC_DIR_NAME}`;

const DEST = "./dist";

const JS_DIR = path.join(SRC, "js/*.js");
const SCSS_DIR = path.join(SRC, "scss/*.scss");
const HTML_DIR = path.join(SRC, "*.html");

const ASSETS_DIR_NAME = "assets";
const ASSETS_DIR = path.join(SRC, `${ASSETS_DIR_NAME}/**/*`);

const LOCALES_DIR_NAME = "locales";
const LOCALES_DIR = path.join(SRC, `${LOCALES_DIR_NAME}/*.json`);

// Polyfill of the future stream.pipeline API
// Can be changed when Node 10.0.0 hits LTS
const pipeline = util.promisify(require("stream.pipeline-shim"));
const gulp = require("gulp");

const gulpif = require("gulp-if")
const sourcemaps = require("gulp-sourcemaps");
const through = require("through2");
const rename = require("gulp-rename");

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
		gulp.src(JS_DIR),
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
		gulp.src(SCSS_DIR),
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
		gulp.src(HTML_DIR),
		htmlmin({collapseWhitespace: true}),
		rename(file => file.dirname = ""),
		gulp.dest(DEST)
	)
}

function assets() {
	return pipeline(
		gulp.src(ASSETS_DIR),
		rename(file => file.dirname = file.dirname.replace(`${SRC_DIR_NAME}\\${ASSETS_DIR_NAME}\\`, '')),
		gulp.dest(DEST)
	);
}

function locales() {
	return pipeline(
		gulp.src(LOCALES_DIR),
		rename(file => file.dirname = file.dirname.replace(`${SRC_DIR_NAME}\\${LOCALES_DIR_NAME}`, '')),
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

	gulp.watch(JS_DIR, gulp.series(js, browserSync.reload));
	gulp.watch(SCSS_DIR, css); // We stream css directly into browserSync
	gulp.watch(HTML_DIR, gulp.series(html, browserSync.reload));
	gulp.watch(ASSETS_DIR, gulp.series(assets, browserSync.reload));
	gulp.watch(LOCALES_DIR, gulp.series(locales, browserSync.reload));
}

exports.serve = gulp.series(build, serve);
