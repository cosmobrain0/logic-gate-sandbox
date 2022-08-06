class RectangleCollider {
	/**
	 * 
	 * @param {Button|Menu} parent 
	 * @param {Number} width 
	 * @param {Number} height 
	 */
	constructor(parent, width, height) {
		this.parent = parent;
		this.size = new Vector(width, height);
	}

	/**
	 * 
	 * @param {Vector} position the point to test
	 * @returns {boolean} if the point is over this collider
	 */
	intersects(position) {
		let pos = this.parent.globalPosition;
		return Utility.inRange(position.x, pos.x, pos.x+this.size.x) && Utility.inRange(position.y, pos.y, pos.y+this.size.y);
	}
}

class CircleCollider {
	/**
	 * 
	 * @param {Button|Menu} parent 
	 * @param {Number} radius 
	 */
	constructor(parent, radius) {
		this.parent = parent;
		this.radius = radius;
	}

	/**
	 * 
	 * @param {Vector} position the point to test
	 * @returns {boolean} if the point is over this collider
	 */
	intersects(position) {
		return position.to(this.parent.globalPosition).sqrLength() < this.radius*this.radius;
	}
}

class RectangleRenderer {
	/**
	 * 
	 * @param {Button|Menu} parent 
	 * @param {Number} width 
	 * @param {Number} height 
	 * @param {String} bgcolour 
	 * @param {String} text 
	 * @param {String} txtcolour 
	 * @param {String} font 
	 */
	constructor(parent, width, height, bgcolour, hoverbg, text, txtcolour, font) {
		this.parent = parent;
		this.width = width;
		this.height = height;
		this.bgcolour = bgcolour;
		this.hoverbg = hoverbg;
		this.text = text;
		this.txtcolour = txtcolour;
		this.font = font;
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	render(ctx) {
		let position = this.parent.globalPosition;
		ctx.fillStyle = this.bgcolour;
		ctx.fillRect(position.x, position.y, this.width, this.height);
		if (this.parent.hover) {
			ctx.fillStyle = this.hoverbg;
			ctx.fillRect(position.x, position.y, this.width, this.height);
		}
		ctx.fillStyle = this.txtcolour;
		ctx.font = this.font;
		let textDetails = ctx.measureText(this.text);
		ctx.fillText(this.text, position.x-textDetails.width/2 + this.width/2, position.y+(textDetails.actualBoundingBoxAscent+textDetails.actualBoundingBoxDescent)/2 + this.height/2);
	}
}

class CircleRenderer {
	/**
	 * 
	 * @param {Button|Menu} parent 
	 * @param {Number} radius 
	 * @param {String} bgcolour 
	 * @param {String} hoverbg
	 * @param {String} text 
	 * @param {String} txtcolour 
	 * @param {String} font 
	 */
	constructor(parent, radius, bgcolour, hoverbg, text, txtcolour, font) {
		this.parent = parent;
		this.radius = radius;
		this.bgcolour = bgcolour;
		this.hoverbg = hoverbg;
		this.text = text;
		this.txtcolour = txtcolour;
		this.font = font;
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	render(ctx) {
		let position = this.parent.globalPosition;
		ctx.fillStyle = this.bgcolour;
		ctx.beginPath();
		ctx.arc(position.x, position.y, this.radius, 0, 2*Math.PI);
		ctx.fill();
		if (this.parent.hover) {
			ctx.fillStyle= this.hoverbg;
			ctx.beginPath();
			ctx.arc(position.x, position.y, this.radius, 0, 2*Math.PI);
			ctx.fill();
		}
		ctx.fillStyle = this.txtcolour;
		ctx.font = this.font;
		let textDetails = ctx.measureText(this.text);
		ctx.fillText(this.text, position.x-textDetails.width/2, position.y+(textDetails.actualBoundingBoxAscent+textDetails.actualBoundingBoxDescent)/2);
	}
}

/**
 * @typedef {RectangleCollider|CircleCollider} Collider
 */

class Button {
	/**
	 * 
	 * @param {Menu?} parent 
	 * @param {Vector} position 
	 * @param {Collider} collider
	 * @param {Renderer} renderer
	 * @param {Function[]} callbacks 
	 * @param {Collider} collider
	 */
	constructor(parent, position, collider, renderer, callbacks) {
		this.collider = collider;
		this.renderer = renderer;
		this.collider.parent = this;
		this.renderer.parent = this;
		this.callbacks = callbacks;
		this.position = position.copy();
		this.parent = parent; // a menu
		this.hover = false;
		if (this.parent) this.parent.addButton(this);
	}

	/**
	 * 
	 * @param {Vector} mouse the position of the cursor
	 * @returns {boolean} wether or not the mouse is hovering over the button
	 */
	isHovering(mouse) {
		return this.collider.intersects(mouse);
	}

	get globalPosition() {
		return Vector.add(this.parent.globalPosition, this.position);
	}

	click() {
		for (let callback of this.callbacks) {
			callback.bind(this, this)();
		}
	}

	draw(ctx) {
		this.renderer.render(ctx);
	}

	destroy() {
		this.parent.removeButton(this);
	}
}

class TextInput {
	/**
	 * 
	 * @param {Menu?} parent 
	 * @param {Vector} position the local position of this input on the menu
	 * @param {Collider} collider a rectangle collider
	 * @param {Function[]} callbacks the functions to be called when this input's value changes
	 */
	constructor(parent, position, collider, callbacks) {
		this.parent = parent;
		this.position = position.copy();
		this.collider = collider;
		this.collider.parent = this;
		this.callbacks = callbacks.slice();
		let input = document.createElement('textarea');
		input.classList.add('input-text');
		input.oninput = () => {
			for (let callback of this.callbacks) callback.bind(this, this)();
		}
		document.body.appendChild(input);
		this.input = input;
		this.update();
		this.parent.addTextInput(this);
	}

	get value() { return this.input.value; }
	get globalPosition() { return this.parent == null ? this.position.copy() : Vector.add(this.parent.globalPosition, this.position); }

	/**
	 * 
	 * @param {Vector} mouse the position of the cursour
	 * @returns {boolean} wether or not the mouse is hovering over the input box
	 */
	isHovering(mouse) {
		return this.collider.intersects(mouse);
	}

	update() {
		let topLeft = Utility.worldToScreenPosition(this.position.x, this.position.y);
		let size = Utility.worldToScreenOffset(this.collider.size.x, this.collider.size.y);
		this.input.style.left = `${floor(topLeft.x)}px`;
		this.input.style.top = `${floor(topLeft.y)}px`;
		this.input.style.width = `${floor(size.x)}px`;
		this.input.style.height = `${floor(size.y)}px`;
	}

	destroy() {
		document.body.removeChild(this.input);
		this.parent.removeTextInput(this);
	}
}

class Menu {
	/**
	 * 
	 * @param {Vector} position 
	 * @param {Menu?} parent 
	 */
	constructor(position, parent, size) {
		this.position = position.copy();
		// NOTE: add dragging stuff to menu, not button
		this.parent = parent; // Menu or null
		if (this.parent) this.parent.addMenu(this);
		/**
		 * @type {Button[]}
		 */
		this.buttons = [];
		/**
		 * @type {TextInput}
		 */
		this.textInputs = [];
		/**
		 * @type {Menu[]}
		 */
		this.menus = [];
		this.size = size instanceof Vector ? size.copy() : new Vector(0, 0);
		this.collider = new RectangleCollider(this, this.size.x, this.size.y);
		this.hover = false;
	}

	/**
	 * 
	 * @param {Vector} mouse the position of the cursor
	 * @returns {boolean} wether or not the mouse is hovering above this menu
	 */
	isHovering(mouse) {
		return this.collider.intersects(mouse);
	}

	get globalPosition() {
		return this.parent == null ? this.position.copy() : Vector.add(this.parent.globalPosition, this.position);
	}

	/**
	 * 
	 * @param {Button} btn 
	 */
	addButton(btn) {
		if (!this.buttons.includes(btn)) this.buttons.push(btn);
		btn.parent = this;
	}

	removeButton(btn) {
		if (this.buttons.includes(btn)) this.buttons.splice(this.buttons.indexOf(btn), 1);
	}

	/**
	 * 
	 * @param {TextInput} input the input to add
	 */
	addTextInput(input) {
		if (!this.textInputs.includes(input)) this.textInputs.push(input);
		input.parent = this;
	}

	/**
	 * 
	 * @param {TextInput} input the input to remove
	 */
	removeTextInput(input) {
		if (this.textInputs.includes(input)) this.textInputs.splice(this.textInputs.indexOf(input), 1);
		input.parent = null;
		if (input.input && document.body.contains(input.input)) document.body.removeChild(input.input);
	}

	/**
	 * 
	 * @param {Menu} menu 
	 */
	addMenu(menu) {
		if (!this.menus.includes(menu)) this.menus.push(menu);
		menu.parent = this;
	}

	/**
	 * 
	 * @param {Vector} mouse position of cursor at the start of mousedown / current position
	 * @param {Vector} mouseEnd position of cursor at the end of mousedown / current position
	 * @param {boolean} mousedown wether or not the mouse is down
	 */
	update(mouse, mouseEnd, mousedown) {
		this.hover = this.isHovering(mouse);
		for (let button of this.buttons) {
			button.hover = button.isHovering(mouseEnd);
			if (button.hover && button.isHovering(mouse) && mousedown) {
				button.click();
			}
		}
		for (let input of this.textInputs) input.update();
		for (let menu of this.menus) menu.update(mouse, mouseEnd, mousedown);
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	draw(ctx) {
		// this.renderer.render();
		for (let i=this.menus.length-1; i>=0; i--) {
			this.menus[i].draw(ctx);
		}
		for (let i=this.buttons.length-1; i>=0; i--) {
			this.buttons[i].draw(ctx);
		}
	}
}
/**
 * 
 * @param {Menu?} parent 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 * @param {String} bgcolour 
 * @param {String} hoverbg
 * @param {String} text 
 * @param {String} txtcolour 
 * @param {String} font 
 * @param {Function[]} callbacks 
 * @returns {Button} a button with a `RectangleCollider` and `RectangleRenderer`
 */
const RectangleButton = (parent, x, y, width, height, bgcolour, hoverbg, text, txtcolour, font, callbacks) => {
	return new Button(
		parent, new Vector(x, y),
		new RectangleCollider(null, width, height),
		new RectangleRenderer(null, width, height, bgcolour, hoverbg, text, txtcolour, font),
		callbacks
	);
}

/**
 * 
 * @param {Menu?} parent 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} radius 
 * @param {String} bgcolour 
 * @param {String} hoverbg 
 * @param {String} text 
 * @param {String} txtcolour 
 * @param {String} font 
 * @param {Function[]} callbacks 
 * @returns {Button} a button with a `CircleCollider` and a `CircleRenderer`
 */
const CircleButton = (parent, x, y, radius, bgcolour, hoverbg, text, txtcolour, font, callbacks) => {
	return new Button(
		parent, new Vector(x, y),
		new CircleCollider(null, radius),
		new CircleRenderer(null, radius, bgcolour, hoverbg, text, txtcolour, font),
		callbacks
	);
}
