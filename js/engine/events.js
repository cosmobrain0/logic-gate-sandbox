/**
 * @type {EventManager}
 */
const Events = {
	mousemove  : [],
	mousedown  : [],
	mouseup    : [],
	keydown    : [],
	keyup      : [],
	wheel      : [],
	touchstart : [],
	touchmove  : [],
	touchcancel: [],
	touchend   : [],
}

/**
 * 
 * @param {Vector} position the position of the cursour which might be hovering over a button
 * @param {Menu} menu the root menu t osearch for buttons
 */
const findHoveredButton = (position, menu) => {
	for (let textInput of menu.textInputs) {
		if (textInput.isHovering(position)) return textInput;
	}
	for (let button of menu.buttons) {
		if (button.isHovering(position)) {
			return button;
		}
	}
	for (let m of menu.menus) {
		let button = findHoveredButton(m);
		if (button) return button;
	}
	return null;
}

onmousemove = e => {
	Input.mouse.position = Utility.adjustMousePosition(e.clientX, e.clientY);
	if (Input.mouse.leftclick.down) Input.mouse.leftclick.path.push(Input.mouse.position.copy());
	if (Input.mouse.rightclick.down) Input.mouse.rightclick.path.push(Input.mouse.position.copy());
	for (let f of Events.mousemove) f(e);
}
onmousedown = e => {
    if (e.button == 0) {
		Input.mouse.leftclick.down = true;
		Input.mouse.leftclick.start = Input.mouse.position.copy();
		Input.mouse.leftclick.path = [Input.mouse.position.copy()];
		let hover = findHoveredButton(Input.mouse.position.copy(), UI);
		if (!hover && Scene.currentScene) hover = findHoveredButton(Input.mouse.position.copy(), Scene.currentScene.UI);
		Input.mouse.leftclick.selected = hover;
	}
    else if (e.button == 2) {
		Input.mouse.rightclick.down = true;
		Input.mouse.rightclick.start = Input.mouse.position.copy();
		Input.mouse.rightclick.path = [Input.mouse.position.copy()];
		let hover = findHoveredButton(Input.mouse.position.copy(), UI);
		if (!hover && Scene.currentScene) hover = findHoveredButton(Input.mouse.position.copy(), Scene.currentScene.UI);
		Input.mouse.rightclick.selected = hover;
	}
	for (let f of Events.mousedown) f(e);
}
onmouseup = e => {
    if (e.button == 0) {
		Input.mouse.leftclick.down = false;
		UI.update(Input.mouse.leftclick.start, Input.mouse.leftclick.down);
		if (Scene.currentScene) Scene.currentScene.UI.update(Input.mouse.leftclick.start, Input.mouse.leftclick.down);
	}
    else if (e.button == 2) Input.mouse.rightclick.down = false;
	for (let f of Events.mouseup) f(e);
}
oncontextmenu = e => e.preventDefault(); // custom context menus?

onkeyup = e => {
    Input.keymap[e.key] = false;
    // handle any one-time-per-key-press inputs
	for (let f of Events.keyup) f(e);
}

onkeydown = e => {
    Input.keymap[e.key] = true;
    // handle any key-held-down inputs
	for (let f of Events.keydown) f(e);
}

onwheel = e => {
    // e.deltaY
	for (let f of Events.wheel) f(e);
}

ontouchstart = e => {
	for (let i=0; i<e.touches.length; i++) {
		/**
		 * @type {MouseButton}
		 */
		let touch = {};
		touch.down = true;
		touch.start = Utility.adjustMousePosition(e.touches[i].clientX, e.touches[i].clientY);
		touch.path = [touch.start.copy()];
		touch.identifier = e.touches[i].identifier;
		let previousTouch = Input.mouse.touches.filter(x => x.identifier == touch.identifier);
		if (previousTouch[0]) {
			Input.mouse.touches[Input.mouse.touches.indexOf(previousTouch[0])] = touch;
		} else {
			Input.mouse.touches.push(touch);
		}
		for (let f of Events.touchstart) f(e, e.touches[i]);
	}
}
ontouchmove = e => {
	for (let i=0; i < e.changedTouches.length; i++) {
		Input.mouse.touches.forEach(x => {
			if (e.changedTouches[i].identifier == x.identifier) {
				let pos = Utility.adjustMousePosition(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
				x.path.push(pos.copy());
			}
		})
		for (let f of Events.touchstart) f(e, e.changedTouches[i]);
	}
}
ontouchcancel = e => {
	for (let i=0; i<e.changedTouches.length; i++) {
		for (let j=Input.mouse.touches.length-1; j>=0; j--) {
			if (e.changedTouches[i].identifier == Input.mouse.touches[j].identifier) {
				Input.mouse.touches[j].down = false;
			}
		}
		for (let f of Events.touchstart) f(e, e.changedTouches[i]);
	}
}
ontouchend = e => {
	for (let i=0; i<e.changedTouches.length; i++) {
		for (let j=Input.mouse.touches.length-1; j>=0; j--) {
			if (e.changedTouches[i].identifier == Input.mouse.touches[j].identifier) {
				Input.mouse.touches[j].down = false;
			}
		}
		for (let f of Events.touchstart) f(e, e.changedTouches[i]);
	}
}