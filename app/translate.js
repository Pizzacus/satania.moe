// I could add more useful comments to my code, but I'm too lazy ¯\_(ツ)_/¯

const defaultLocale = document.documentElement.lang;

var localeSelect = document.getElementById("locale-select"),
	options = localeSelect.getElementsByTagName("option"),
	locales = {};

window.locales = locales;

function dispatchEvent() {
	const event = document.createEvent('Event');
	event.initEvent('locale-change', true, true);
	document.dispatchEvent(event);
}

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
			text = element.innerHTML
				.replace(/[\n\r\t]/g, '')
				.replace(/<br\/?>/g, "<br />");

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

locales[defaultLocale] = generateTranslationTable();
window.generateTranslationTable = generateTranslationTable;

function changeLocale(localeName, skipReset) {
	// Changes the locale, but reset it first, in case some text in a locale aren't translated in another one
	// Example: changeLocale("fr")
	if(!skipReset) {
		changeLocale(defaultLocale, true);
	}

	function handleObject(locale, element) {
		for(let value in locale) {
			if(typeof locale[value] === "string") {
				const match = element.querySelector("[i18n=" + value + "]");
				if (match && !match.closest("[i18n-skip]")) {
					match.innerHTML = locale[value];
				}
			} else {
				if (element.querySelector("[i18n-group=" + value + "]")) {
					handleObject(locale[value], element.querySelector("[i18n-group=" + value + "]"));
				}
			}
		}
	}

	handleObject(locales[localeName], document.body);
	window.javascriptLocales = locales[localeName]._javascriptLocales;
	document.documentElement.lang = localeName;
	
	if (!skipReset) {
		if (localeName === defaultLocale) {
			window.history.pushState('', '', window.location.pathname)
		} else {
			window.location.hash = localeName;
		}
	}

	dispatchEvent();
}

const bestLocale = (navigator.languages || [window.navigator.userLanguage || window.navigator.language])
	.map(lang => 
		([...options].find(option => 
			lang.startsWith(option.lang) ||
			(option.lang === 'zh-Hans' && (
				lang === 'zh-CN' || (
					lang === 'zh' &&
					!navigator.languages.some(lang => lang.startsWith('zh-'))
				)
			))
		) || {}).value
	)
	.filter(lang => lang != null)[0];

for (const option of options) {
	let shouldSwitch = false;

	if (window.location.hash.replace(/^\#/g, "") === option.value) {
		localeSelect.value = option.value;
		shouldSwitch = true;
	}

	if (option.value !== defaultLocale) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", "locale/" + option.value + ".json", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var translation = JSON.parse(xhr.responseText);
				locales[option.value] = translation;
				option.disabled = false;

				postDownload();
			}
		};

		xhr.send();

	} else {
		setTimeout(postDownload);
	}

	function postDownload() {
		if (shouldSwitch) {
			changeLocale(option.value);
		}

		if (option.value === bestLocale && localeSelect.value !== option.value) {
			const translation = locales[bestLocale]['main-intro']['language-protip'];

			if (translation) {
				document.getElementById('language-protip-text').innerHTML = locales[bestLocale]['main-intro']['language-protip'];
				document.getElementById('language-protip').style.display = "block";
			}
		}
	}
}

localeSelect.onchange = function(e) {
	changeLocale(e.target.value);
}

localeSelect.onclick = () => document.getElementById('language-protip').style.display = "none";

function prettyYAML(yaml) {
	return yaml
		.replace(/^(\S.*)$/gm, "\n$1")
		.replace(/\r\n|\r|\n/g, "\r\n");
}

document.getElementById("download").onclick = () => {
	let download = document.createElement("A"),
		isYAML = formatSelect.value === "yaml";
	download.href = URL.createObjectURL(new Blob(
		[isYAML ? prettyYAML(jsyaml.safeDump(locales[defaultLocale])) : JSON.stringify(locales[defaultLocale], null, "\t")], 
		{
			type : isYAML ? " application/x-yaml" : "application/json"
		}
	));
	download.download = isYAML ? "locale.yaml" : "locale.json";
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
		reader.addEventListener("loadend", event => resolve(event.target.result));
		reader.addEventListener("error", reject);
		reader.readAsText(blob);
	});
}

function loadScript(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.onload = resolve;
		script.onerror = reject;

		document.head.appendChild(script);
	})
}

const formatSelect = document.getElementById("format");

document.getElementById("upload").onclick = () => {
	if (formatSelect.disabled) return;

	selectFile({
		accept: ".json, .yaml"
	}).then(files => {
		blobToString(files[0]).then(content => {
			locales["translator-mode"] = (files[0].type === "application/json") ? JSON.parse(content): jsyaml.safeLoad(content);
			changeLocale("translator-mode");
		})
	})
}

if (window.location.hash === "#translator-mode") {
	loadScript("https://cdn.rawgit.com/nodeca/js-yaml/bee7e998/dist/js-yaml.min.js")
		.then(() => {
			formatSelect.disabled = false;
		})
		.catch(() => {
			formatSelect.disabled = false;
			formatSelect.value = "json";
			document.getElementById("yaml").disabled = true;
		});
}