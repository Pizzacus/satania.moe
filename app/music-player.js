const {Howl, Howler} = require('howler');

const SATANIA_VOCALS_POS = 52;

const playState = {
	wasPlaying: false,
	isLoaded: false,
	focusTimeBar: false,
	focusVolumeBar: false,
	danceReady: false,
	barPos: 0
};

const song = new Howl({
	src: ['satania-drop.mp3'],
	onload: () => playState.isLoaded = true
});

const musicPlayer = document.getElementById('music-player');
const musicPlayerContainer = document.getElementById('music-player-container');

const playButton = musicPlayer.querySelector('.play-controller');
const playIcon = playButton.querySelector('i');

const timeSlider = musicPlayer.querySelector('.time-bar');
const timeSliderElapsed = timeSlider.querySelector('.elapsed');

const timeProgression = musicPlayer.querySelector('.time-progression')
const countdown = musicPlayer.querySelector('.countdown');

const volumeController = musicPlayer.querySelector('.volume');
const volumeSlider = musicPlayer.querySelector('.volume-bar');
const volumeFill = musicPlayer.querySelector('.volume-fill');

const dance = document.getElementById('satania-dance');

musicPlayerContainer.style.display = 'block';

playButton.addEventListener('click', () => {
	if (musicPlayer.classList.contains('display-intro')) {
		musicPlayer.classList.add('display-loading');
		musicPlayer.classList.remove('display-intro');
	}

	if (song.playing()) {
		song.pause();
	} else {
		song.play();
	}
});

playButton.addEventListener('touchstart', () => {
	volumeController.style.display = 'none';
})

function formatTime(time) {
	if (!Number.isFinite(time)) {
		time = 0;
	}

	const seconds = Math.floor(time % 60);
	const minutes = Math.floor(time / 60);

	return `${('00' + minutes).substr(-1)}:${('00' + seconds).substr(-2)}`;
}

const OFFSET = 0.35;
const BPM = 130 / 2;
const BEAT_DURATION = 60 / BPM;
const NUMBER_OF_FRAMES = 22;
const ANIMATION_OFFSET = 18;

function setBarPos(pos) {
	const seek = pos * song.duration() || 0;

	timeSliderElapsed.style.width = pos * 100 + '%';
	timeProgression.innerText = `${formatTime(seek)} / ${formatTime(song.duration())}`;

	const timeUntilSatania = SATANIA_VOCALS_POS - seek;
	document.getElementById('time-until-satania').innerText = Math.max(Math.ceil(timeUntilSatania), 0);

	if (timeUntilSatania <= 0) {
		countdown.classList.add('hidden');
	} else {
		countdown.classList.remove('hidden');
	}

	const timeSinceBeat = (seek + OFFSET) % BEAT_DURATION;
	const currentFrame = (Math.floor((timeSinceBeat / BEAT_DURATION) * NUMBER_OF_FRAMES) + ANIMATION_OFFSET) % NUMBER_OF_FRAMES;

	dance.style.backgroundPosition = `${currentFrame / (NUMBER_OF_FRAMES - 1) * 100}% 0`;

	if (
		(seek > 66 && seek < 96) ||
		(seek > 110.5 && seek < 140) ||
		(seek > 192 && seek < 222)
	) {
		dance.style.opacity = 1;
	} else {
		dance.style.opacity = 0;
	}

	playState.beat = timeSinceBeat;
}

function updateSong() {
	if (musicPlayer.classList.contains('display-loading') && song.state() === 'loaded') {
		musicPlayer.classList.remove('display-loading');
	}

	if (song.playing() && !playState.focusTimeBar) {
		setBarPos(song.seek() / song.duration() || 0);
	}

	volumeFill.style.width = song.volume() * 100 + '%';

	if (song.playing()) {
		playIcon.className = 'fas fa-pause';
	} else {
		playIcon.className = 'fas fa-play';
	}

	window.requestAnimationFrame(updateSong);
}

window.requestAnimationFrame(updateSong);

function mouseDown(event) {
	playState.focusTimeBar = true;
	playState.wasPlaying = song.playing();

	song.pause();
	
	mouseUpdate(event);
}

timeSlider.addEventListener('mousedown', mouseDown);
timeSlider.addEventListener('touchstart', mouseDown);

function mouseUpdate(event) {
	if (playState.focusTimeBar) {
		event.preventDefault();

		if (event.touches) event = event.touches[0];

		playState.barPos = Math.min(
			Math.max(
				(event.clientX - timeSlider.offsetLeft) / timeSlider.offsetWidth,
				0
			),
			1
		);

		setBarPos(playState.barPos);
	}
}

document.addEventListener('mousemove', mouseUpdate);
document.addEventListener('touchmove', mouseUpdate);

function mouseUp() {
	if (playState.focusTimeBar) {
		song.seek(playState.barPos * song.duration());

		if (playState.wasPlaying) {
			song.play();
		}
	}

	playState.focusTimeBar = false;
}

document.addEventListener('mouseup', mouseUp);
document.addEventListener('touchend', mouseUp);

function volumeMouseUpdate(event) {
	if (playState.focusVolumeBar) {
		event.preventDefault();
		song.volume(Math.min(
			Math.max(
				(event.clientX - volumeSlider.offsetLeft) / volumeSlider.offsetWidth,
				0
			),
			1
		));
	}
}

document.addEventListener('mousemove', volumeMouseUpdate);
volumeController.addEventListener('mousedown', event => {
	playState.focusVolumeBar = true;
	volumeMouseUpdate(event);
});

document.addEventListener('mouseup', () => {
	playState.focusVolumeBar = false;
});

// val is a number in a range, superior or equal 0 and inferior to maxRange
// Transforms val from a linear scale to a log scale
// The output is a number between or equal to min and max
function toLog(min, max, val, maxRange) {
	return min * Math.pow(max / min, val / (maxRange - 1));
}

const BLEED_BARS = 12; // Numbers of bar to omit to the right, to compensate for the fact that most formats dont save really high frequencies
const NUMBER_OF_LINES = 256;

if (Howler.usingWebAudio) {
	const canvas = musicPlayerContainer.querySelector('#sound-visualizer');
	const ctx = canvas.getContext('2d');

	const analyser = Howler.ctx.createAnalyser();
	analyser.fftSize = 8192;
	analyser.minDecibels = -100;
	analyser.maxDecibels = -10;
	analyser.smoothingTimeConstant = 0.8;

	Howler.masterGain.disconnect(Howler.ctx.destination)
	Howler.masterGain.connect(analyser);
	analyser.connect(Howler.ctx.destination);

	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);

	function visualizer() {
		canvas.height = musicPlayerContainer.offsetHeight;
		canvas.width = musicPlayerContainer.offsetWidth;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		analyser.getByteFrequencyData(dataArray);

		ctx.fillStyle = `rgba(238, 102, 102, 0.5)`;

		const barWidth = (canvas.width / (NUMBER_OF_LINES - BLEED_BARS));

		let lastIndex = -1;

		for (let i = 0; i < NUMBER_OF_LINES; i++) {
			const x = i * barWidth;
			const freq = toLog(20, 20000, i, NUMBER_OF_LINES);
			const index = Math.max(
				lastIndex + 1, // Prevents the same index from being used twice
				Math.floor(freq / 20000 * bufferLength)
			);

			lastIndex = index;

			const height = dataArray[index];
			ctx.fillRect(x, canvas.height, barWidth, (height / 255) * -canvas.height);
		}

		window.requestAnimationFrame(visualizer);
	}

	window.requestAnimationFrame(visualizer);
}