// I could add more useful comments to my code, but I'm too lazy ¯\_(ツ)_/¯

var localeSelect = document.getElementById("locale-select"),
	options = localeSelect.getElementsByTagName("option"),
	locales = {};

if (window.Element && !Element.prototype.closest) {
	// Thanks Mozilla <3 https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
	// Polyfill for the closest function, since a lot of browsers don't support it
	Element.prototype.closest =
		function(s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s),
				i,
				el = this;
			do {
				i = matches.length;
				while (--i >= 0 && matches.item(i) !== el) {};
			} while ((i < 0) && (el = el.parentElement));
			return el;
		};
}

function generateTranslationTable() {
	"use strict";
	// Function that uses the page's content to generate a translation table

	function setValue(object, path, value) {
		// Function that changes the value of an object based on a path contained in an array
		// For example: "setValue(obj, ["foo", "bar"], 123)" is the same as "obj.foo.bar = 123;"

		// <3 https://stackoverflow.com/a/20240290
		for (var i = 0; i < path.length - 1; i++) {
			var key = path[i];
			if (key in object) {
				object = object[key];
			} else {
				object[key] = {};
				object = object[key];
			}
		}
		object[path[path.length - 1]] = value;
	}


	var translatedElements = document.querySelectorAll("[i18n]"),
		translationTable = {};

	for (let i = 0; i < translatedElements.length; i++) {
		var element = translatedElements[i],
			path = [element.getAttribute("i18n")],
			text = element.innerHTML;

		while (element.closest("[i18n-group]")) {
			let groupElement = element.closest("[i18n-group]");

			path.unshift(groupElement.getAttribute("i18n-group"));

			element = groupElement.parentElement;
		}

		setValue(translationTable, path, text);
	}

	translationTable._javascriptLocales = javascriptLocales;

	return translationTable;
}

locales.default = generateTranslationTable()

function changeLocale(localeName, skipDefaultLocale) {
	// Changes the locale, but reset it first, in case some text in a locale aren't translated in another one
	// Example: changeLocale("fr")
	if(!skipDefaultLocale) {
		changeLocale("default", true);
	}

	function handleObject(locale, element) {
		for(let value in locale) {
			if(typeof locale[value] === "string") {
				if (element.querySelector("[i18n=" + value + "]")) {
					if (localeName === "dra") {
						locale[value] = locale[value].toLowerCase();

						locale[value] = locale[value].replace("aa","A");
						locale[value] = locale[value].replace("ah","H");
						locale[value] = locale[value].replace("ei","W");
						locale[value] = locale[value].replace("ey","E");
						locale[value] = locale[value].replace("ii","I");
						locale[value] = locale[value].replace("ir","J");
						locale[value] = locale[value].replace("oo","O");
						locale[value] = locale[value].replace("uu","U");
						locale[value] = locale[value].replace("ur","R");

						locale[value] = locale[value].replace(",","");
					}
					element.querySelector("[i18n=" + value + "]").innerHTML = locale[value];
				}
			} else {
				if (element.querySelector("[i18n-group=" + value + "]")) {
					handleObject(locale[value], element.querySelector("[i18n-group=" + value + "]"));
				}
			}
		}
	}

	handleObject(locales[localeName], document.body);
	javascriptLocales = locales[localeName]._javascriptLocales;
	document.documentElement.lang = (localeName === "default") ? "en" : localeName;

	if(localeName === "default") {
		document.documentElement.lang = "en";
		window.history.pushState('', '', window.location.pathname)
	} else {
		document.documentElement.lang = localeName;
		window.location.hash = localeName;
	}
}

for (let option of options) {
	if (option.value !== "default") {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", "locale/" + option.value + ".json", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var translation = JSON.parse(xhr.responseText);
				locales[option.value] = translation;
				option.disabled = false;

				if (window.location.hash.replace(/^\#/g, "") === option.value) {
					changeLocale(option.value);
					localeSelect.value = option.value
				}
			}
		};
		xhr.send();
	}
}

localeSelect.onchange = function(e) {
	changeLocale(e.target.value);
}

document.getElementById("download").onclick = () => {
	let download = document.createElement("A");
	download.href = URL.createObjectURL(new Blob([JSON.stringify(locales.default, null, "\t")], {type : 'application/json'}));
	download.download = "locale.json";
	//download.setAttribute("style", "position:absolute !important;top:-9999vh !important;opacity:0 !important;height:0 !important;width:0 !important;z-index:-9999 !important;");

	document.body.appendChild(download);
	download.click();
	document.body.removeChild(download);
}

function selectFile(options = {}) {
	return new Promise((resolve, reject) => {
		const upload = document.createElement("input");
		upload.type = "file";
		upload.accept = options.accept || "";
		upload.multiple = options.multiple || false;
		upload.webkitdirectory = options.directory || false;
		upload.setAttribute("style", 
			"position:absolute !important;" +
			"top:-9999vh !important;" + 
			"opacity:0 !important;" + 
			"height:0 !important;" + 
			"width:0 !important; " + 
			"z-index:-9999 !important;");

		document.body.appendChild(upload);

		upload.click();

		upload.onchange = () => {
			let files = upload.files;
			document.body.removeChild(upload);

			if (typeof options.array === "undefined" || options.array) {
				files = Array(...files);
			}

			resolve(files);
		}
	});
}

function blobToString(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.addEventListener('loadend', event => {
			console.log(event);
			const text = event.target.result;
			resolve(text);
		});

		reader.readAsText(blob);
	});
}

document.getElementById("upload").onclick = () => {
	selectFile().then(files => {
		blobToString(files[0]).then(content => {
			locales["translator-mode"] = JSON.parse(content);
			changeLocale("translator-mode");
		})
	})
}