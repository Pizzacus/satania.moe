const snowflakeInterval = 50;
const windStrength = {
	min: 0.01,
	max: 0.025
};
const snowflakeSize = {
	min: 2.5,
	max: 7.5
}

const snowflakeSpeed = {
	min: 100,
	max: 150
}

function minmax(value, {min, max}) {
	return (value * (max - min)) + min;
}

function bindSnow(canvas) {
	if (!canvas instanceof HTMLCanvasElement) return;

	const ctx = canvas.getContext("2d");
	let snowflakes = [];

	let lastTick = performance.now();

	function tick() {
		const tickTime = performance.now() - lastTick;
		const wind = Math.cos(Date.now() / 10000);
		lastTick = performance.now();

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#fff";
		for (let snowflake of snowflakes) {
			snowflake.y = (performance.now() - snowflake.created) / 1000 * minmax(snowflake.size, snowflakeSpeed);

			ctx.beginPath();
			ctx.arc(snowflake.x * canvas.width, snowflake.y, minmax(snowflake.size, snowflakeSize), 0, Math.PI * 2);
			ctx.fill();
	
			snowflake.x += wind * minmax(1 - snowflake.size, windStrength) * (tickTime / 1000);
		}

		snowflakes = snowflakes.filter(snowflake => snowflake.y < canvas.height * 1.5)

		window.requestAnimationFrame(tick);
	}

	window.setInterval(() => {
		const canvasMargin = (canvas.height / snowflakeSpeed.max) * windStrength.max;
		snowflakes.push({
			created: performance.now(),
			x: (Math.random() * (1 + (canvasMargin * 2))) - canvasMargin,
			size: Math.random()
		});
	}, snowflakeInterval);

	window.requestAnimationFrame(tick);
}

const snowCanvas = [...document.querySelectorAll("canvas.snow")];

snowCanvas.map(bindSnow);

function bindFull(canvas) {
	if (!canvas instanceof HTMLCanvasElement) return;

	function fullCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	window.addEventListener('resize', fullCanvas, false);
	fullCanvas();
}

const fullCanvas = [...document.querySelectorAll("canvas.full")];

fullCanvas.map(bindFull);