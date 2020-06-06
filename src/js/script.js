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
	const selection = window.getSelection();
	const previousSelection = []; // Array where the previous selections are stored

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
document.body.addEventListener("click", () => {
	// IE shows a confirmation box when trying to copy, so we must disable the easter egg on this browser
	if (!copied && !/\b(Trident|MSIE)\b/.test(navigator.userAgent)) {
		copy(javascriptLocales.copyMessage);
		copied = true;
	}
});

/*
	SLIDESHOW
*/

for (const slideshow of document.getElementsByClassName("slideshow")) {
	const slides = slideshow.querySelectorAll("picture");
	const sourceBtn = slideshow.querySelector("a.source")
	let currentSlide = 0;

	sourceBtn.href = slides[0].getAttribute("data-source");

	setInterval(() => {
		slides[currentSlide].classList.remove("shown");
		currentSlide = (currentSlide + 1) % slides.length;
		slides[currentSlide].classList.add("shown");

		sourceBtn.href = slides[currentSlide].getAttribute("data-source");
	}, 2500);
}

/*
	SEARCHBAR
*/

const searchbar = document.getElementById("searchbar");
const searchbarText = document.getElementById("searchbar-text");
let lastTimeout;

searchbar.addEventListener("click", event => {
	switch (event.target.id) {
		case "search-by-voice":
			searchbarText.innerText = javascriptLocales.searchByVoice;
			break;

		case "search-button":
			searchbarText.innerText = javascriptLocales.searchButton;
			break;

		default:
			searchbarText.innerText = javascriptLocales.searchBar;
			break;
	}

	if (lastTimeout) {
		clearTimeout(lastTimeout);
		lastTimeout = null;
	}

	lastTimeout = setTimeout(() => {
		searchbarText.innerText = javascriptLocales.searchBarName || "satania";
	}, 2000);
});

let audioPlayingAtOnce = 0;

document.getElementById("listen").addEventListener("click", () => {
	const audio = new Audio();
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
});

const laughKeys = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a"
];

let laughPos = 0;
let laughing = false;

document.addEventListener("keydown", event => {
	if (laughing) return;

	const key = event.key;
	if (key === laughKeys[laughPos]) {
		laughPos++;

		if (laughPos >= laughKeys.length) {
			laughPos = 0;
			laughing = true;

			const audio = new Audio();
			audio.src = "laugh.mp3";
			audio.play();

			audio.addEventListener("ended", () => {
				laughing = false;
			});
		}
	} else {
		laughPos = 0;
	}
});

let guild, subreddit;

fetch("/discord.json?with_counts=true")
	.then(res => res.json())
	.then(fetchedGuild => {
		guild = fetchedGuild;
		updateCounts();
	});

fetch("/reddit.json")
	.then(res => res.json())
	.then(fetchedSubreddit => {
		subreddit = fetchedSubreddit;
		updateCounts();
	});

function updateCounts() {
	console.dir(document.documentElement.lang);
	if (guild) {
		document.getElementById("discord-number").innerText = guild.approximate_member_count.toLocaleString(document.documentElement.lang);
		document.getElementById("discord-count").style.display = "inline-block";
	}

	if (subreddit) {
		document.getElementById("reddit-number").innerText = subreddit.data.subscribers.toLocaleString(document.documentElement.lang);
		document.getElementById("reddit-count").style.display = "inline-block";
	}

	document.getElementById('last-updated').innerText =
		(new Date(1565782812058))
			.toLocaleDateString(document.body.parentElement.lang, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
}

document.addEventListener("locale-change", updateCounts);

document.getElementById('close-language-protip').addEventListener("click", () => {
	document.getElementById('language-protip').style.display = 'none';
});
