/**
 * @type {Canvas}
 */
const Canvas = {
	width: 2560,
	height: 1440,
	c: document.createElement('canvas'),
}

// setup default canvas stuff
{
	Canvas.ctx = Canvas.c.getContext("2d");
	Canvas.c.width = Canvas.width;
	Canvas.c.height = Canvas.height;
	Canvas.c.style.background = '#000';
	Canvas.ctx.textBaseline = 'top';
	Canvas.ctx.fillStyle = '#fff';
	Canvas.ctx.font = "40px Arial";
	Canvas.ctx.imageSmoothingEnabled = false;
	document.body.appendChild(Canvas.c);
}

class MouseButton {
	/**
	 * 
	 * @param {Vector} start 
	 * @param {boolean} down 
	 */
	constructor(start, down, identifier=null) {
		this.down = down;
		this.start = start.copy();
		this.path = [];
		this.identifier = identifier;
		this.selected = null;
	}

	drag() {
		if (this.path.length) return this.path[this.path.length-1].to(this.start).length();
		return 0;
	}
}
/**
 * @property {Mouse} Mouse information regarding mouse / touch input
 * @property {Object} keymap shows which keys are currently pressed
 */
const Input = {
	mouse:	{
		position: new Vector(0, 0),
		leftclick: new MouseButton(new Vector(0, 0), false),
		rightclick: new MouseButton(new Vector(0, 0), false),
		touches: []
	},
	keymap: {}
}
const UI = new Menu(new Vector(0, 0), null, new Vector(Canvas.width, Canvas.height));
const Time = {
	previousFrameTime: null,
	currentFrameTime: null,
	lastDeltaTime: null,
	deltaTime: null,
	paused: false,
	pause: () => {
		Time.paused = true;
		if (Scene.currentScene) Scene.currentScene.pause();
	},
	unpause: () => {
		Time.paused = false;
		if (Scene.currentScene) Scene.currentScene.cont();
	},
	togglePause: () => {
		if (Time.paused) Time.unpause();
		else Time.pause();
	}
};
/**
 * @type {Matter.Engine}
 */
let physicsEngine; // physics engine

window.onload = () => {
	physicsEngine = Matter.Engine.create();
	Time.paused = false;
	Time.previousFrameTime = Date.now();
    requestAnimationFrame(main);
}

const main = (t) => {
	Time.currentFrameTime = t;
	Time.lastDeltaTime = Time.deltaTime == null ? 16 : Time.deltaTime;
	Time.deltaTime = Time.currentFrameTime - Time.previousFrameTime;
	if (!Time.paused) {
		let totalTimeRequired = Time.deltaTime;
		let previousX = Time.lastDeltaTime%10;
		if (previousX == 0) previousX = 10;
		let currentX = 0;
		let totalTimeDone = 0;
		while (totalTimeDone < totalTimeRequired) {
			currentX = min(totalTimeRequired-totalTimeDone, 10);
			Matter.Engine.update(physicsEngine, currentX, currentX/previousX);
			totalTimeDone += currentX;
			previousX = currentX;
		}
		if (!Scene.currentTransition && Scene.currentScene) Scene.currentScene.calc(Scene.currentScene);
		if (Scene.currentTransition) {
			Scene.transitionFrom.calc(Scene.transitionFrom);
			Scene.transitioningTo.calc(Scene.transitioningTo);
			Scene.currentTransition.time += Time.deltaTime;
		}
	}
	Time.previousFrameTime = Time.currentFrameTime;
    Canvas.ctx.clearRect(0, 0, Canvas.c.width, Canvas.c.height);
    Utility.adjustSize(Canvas.c, Canvas.ctx);
	if (!Scene.currentTransition && Scene.currentScene) Scene.currentScene.draw(Scene.currentScene, Canvas.ctx);
	UI.draw(Canvas.ctx);
	if (Scene.currentTransition) {
		Utility.adjustSize(Scene.currentTransition.startCanvas, Scene.currentTransition.startContext);
		Utility.adjustSize(Scene.currentTransition.endCanvas, Scene.currentTransition.endContext);
		Scene.transitionFrom.draw(Scene.transitionFrom, Scene.currentTransition.startContext);
        Scene.transitioningTo.draw(Scene.transitioningTo, Scene.currentTransition.endContext);
		let transitionComplete = Scene.currentTransition.handler(Scene.transitionFrom, Scene.transitioningTo, Scene.currentTransition, Canvas.ctx);
		if (transitionComplete) {
			// Scene.transitionFrom.pause(Scene.transitionFrom);
			// Scene.transitionFrom.end(Scene.transitionFrom);
			// Scene.currentScene = Scene.trans
			// Scene.immediateLoad(Scene.transitioningTo);
			Scene.unload(Scene.transitionFrom);
			Scene.currentScene = Scene.transitioningTo;
		}
	}
    requestAnimationFrame(main);
}