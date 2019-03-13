import "@babel/polyfill";
import 'whatwg-fetch';
import "./closest";

window.javascriptLocales = {
	copyMessage: "Just wanted to let you know that Satania is always with you! Even inside your clipboard! We are everywhere and you should really join us!\n" +
		"Also yes, any website can access your clipboard however they want, isn't that creepy?\n" +
		"Regardless, Satania is the BEST WAIFU, and you should agree! http://satania.moe/",
	searchByVoice: "lmao, no one uses this button",
	searchButton: "but the results are already there =]",
	searchBar: "this isn't a real search bar",
	snedHelp: "pls send helppp",
	perfection: "perfection",
	searchBarName: "satania",
	newTab: "Link opens in a new tab."
}

/*
	CLIPBOARD AUTO-COPY SCRIPT
*/

function copy(text = "") {
	const selection = window.getSelection(),
		previousSelection = []; // Array where the previous selections are stored

	for (let i = 0; i < selection.rangeCount; i++) {
		// Loops over every selections and add them to the array
		previousSelection[i] = selection.getRangeAt(i);
	}

	// Clear all the previous selections (we'll re-select them later)
	selection.removeAllRanges();

	const range = document.createRange(), // Our new selection that will contain the text to copy
		selectionElement = document.createElement("span"); // The hidden element that will contain the text that will be selected

	// Add the text to the element
	selectionElement.innerText = text;

	// Add CSS rules that should theorically prevent the hidden element from impacting the page layout in any way
	selectionElement.setAttribute("style", `
		position:absolute !important;
		top:-9999vh !important;
		opacity:0 !important;
		height:0 !important;
		width:0 !important;
		pointer-events:none !important;
		z-index:-9999 !important;
	`);

	// Add the element to the document (We hade to, in order to select it)
	document.body.appendChild(selectionElement);

	// Make the range select the entire content of the element
	range.selectNodeContents(selectionElement);

	// Add that range to the selection.
	selection.addRange(range);

	// Copy the selection to clipboard.
	document.execCommand('copy');

	// Clear the selection
	selection.removeAllRanges();

	// Remove the hidden element
	document.body.removeChild(selectionElement);

	for (let i = 0; i < previousSelection.length; i++) {
		// Re-select everything that was selected
		selection.addRange(previousSelection[i]);
	}
}

let copied = false;
document.body.onclick = () => {
	// IE shows a confirmation box when trying to copy, so we must disable the easter egg on this browser
	if (!copied && !/\b(Trident|MSIE)\b/.test(navigator.userAgent)) {
		copy(javascriptLocales.copyMessage);
		copied = true;
	}
}

/*
	LINK THAT OPEN IN NEW TABS
*/

// Makes a link open in a new tab (or does nothing if the element isn't a link)
function linkOpenInNewTab(element) {
	if (element.tagName === "A" && !element.newTabHandled) {
		element.newTabHandled = true;

		element.addEventListener("click", event => {
			event.preventDefault();
			window.open(element.href, '_blank').focus();
		});

		element.addEventListener("mouseover", event => {
			element.titleBeforeHover = element.title;
			element.title = javascriptLocales.newTab || "Link opens in a new tab.";
		});

		element.addEventListener("mouseout", event => {
			element.title = element.titleBeforeHover;

			if (element.title === "") {
				element.removeAttribute("title");
			}
		});
	}
}

// Same as linkOpenInNewTab, but also make all the child that are link open in a new tab, too
function refreshLinks(element = document.body) {
	linkOpenInNewTab(element);

	const links = element.getElementsByTagName("a");
	for (let link of links) {
		linkOpenInNewTab(link);
	}
}

window.onload = () => {
	refreshLinks();

	// Create an observer, which will make sure the links open in a new tab whenever the page changes
	var observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			refreshLinks(mutation.target);
		});
	});

	observer.observe(document.body, {
		attributes: true,
		childList: true,
		characterData: false,
		subtree: true
	});
}

/*
	SLIDESHOW
*/

const slideshows = document.getElementsByClassName("slideshow");

for (let slideshow of slideshows) {
	let slides = slideshow.getElementsByTagName("picture");

	slideshow.currentSlide = 0;

	slideshow.getElementsByClassName("source")[0].href = slides[0].getAttribute("x-source");

	window.setInterval(() => {
		slides[slideshow.currentSlide].classList.remove("shown");
		slideshow.currentSlide = (slideshow.currentSlide + 1) % slides.length;
		slides[slideshow.currentSlide].classList.add("shown");

		slideshow.getElementsByClassName("source")[0].href = slides[slideshow.currentSlide].getAttribute("x-source");
	}, 2500);
}

/*
	SEARCHBAR
*/

var searchbar = document.getElementById("searchbar");

searchbar.onclick = event => {
	let span = searchbar.getElementsByTagName("span")[0];
	switch (event.target.id) {
		case "search-by-voice":
			span.innerText = javascriptLocales.searchByVoice;
			break;

		case "search-button":
			span.innerText = javascriptLocales.searchButton;
			break;

		default:
			span.innerText = javascriptLocales.searchBar;
			break;
	}

	window.setTimeout(() => {
		span.innerText = javascriptLocales.searchBarName || "satania";
	}, 2000);
}

var audioPlayingAtOnce = 0;

document.getElementById("listen").onclick = () => {
	var audio = new Audio();
	audio.src = "perfection.mp3";
	audio.play();

	audio.addEventListener("ended", () => {
		audioPlayingAtOnce--;

		if (audioPlayingAtOnce < 8) {
			document.getElementById("definition-name").innerText = javascriptLocales.perfection;
		}
	});

	audioPlayingAtOnce++;

	if (audioPlayingAtOnce > 10) {
		document.getElementById("definition-name").innerText = javascriptLocales.snedHelp;
	}
}

var laughKeys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
	laughPos = 0,
	laughing = false;

document.body.onkeyup = event => {
	if (!laughing) {
		var key = event.keyCode;
		if (key === laughKeys[laughPos]) {
			laughPos++;
			if (laughPos >= laughKeys.length) {
				laughPos = 0;
				laughing = true;

				var audio = new Audio();
				audio.src = "laugh.mp3";
				audio.play();

				audio.addEventListener("ended", () => {
					laughing = false;
				});
			}
		} else {
			laughPos = 0;
		}
	}
}

function discordInfo(invite) {
	return fetch(`https://discordapp.com/api/v6/invite/${invite}?with_counts=true`)
		.then(res => res.json());
}

function subredditInfo(subreddit) {
	return fetch(`https://www.reddit.com/r/${subreddit}/about.json`)
		.then(res => res.json());
}

let guild, subreddit;

discordInfo("rC9ebp7").then(fetchedGuild => {
	guild = fetchedGuild;
	updateCounts();
})

subredditInfo("satania").then(fetchedSubreddit => {
	subreddit = fetchedSubreddit;
	updateCounts();
})

function updateCounts() {
	if (guild) {
		document.getElementById("discord-number").innerText = guild.approximate_member_count;
		document.getElementById("discord-count").style.display = "inline-block";
	}

	if (subreddit) {
		document.getElementById("reddit-number").innerText = subreddit.data.subscribers;
		document.getElementById("reddit-count").style.display = "inline-block";
	}

	document.getElementById('last-updated').innerText =
		(new Date(1519743162656))
			.toLocaleDateString(document.body.parentElement.lang, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
}

document.addEventListener("locale-change", updateCounts);

document.getElementById('close-language-protip').onclick =
	() => document.getElementById('language-protip').style.display = 'none';
