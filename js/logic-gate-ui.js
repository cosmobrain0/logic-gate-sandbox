class BitUI extends Button {
    static radius = 20;
    static falseColour = "#f30";
    static trueColour = "#07f";
    /**
     * 
     * @param {Bit} parent 
     */
    constructor(parent) {
        super(null, parent.position,
            new CircleCollider(null, BitUI.radius),
            new CircleRenderer(null, BitUI.radius, "#555", "#fff8", "", "#fff", "30px Arial"), [
                button => button.bitParent.value = !button.bitParent.value,
            ]
        );
        this.bitParent = parent;
    }

    updateUI() {
        this.position = this.bitParent.position.copy();
        this.renderer.bgcolour = this.bitParent.value ? BitUI.trueColour : BitUI.falseColour;
    }
}

class CustomGateUI extends Button {
    static colour = "#ccc";
    /**
     * 
     * @param {CustomGate} parent 
     */
    constructor(parent) {
        let size = parent.size();
        super(null, parent.position.copy().subtract(size.x/2, size.y/2),
            new RectangleCollider(null, size.x, size.y),
            new RectangleRenderer(null, size.x, size.y, CustomGateUI.colour, "#fff8", parent.name, "#000", "30px Arial"),
            []
        ); // event handling is done elsewhere in an onmouseup event
        this.gateParent = parent;
    }

    updateUI() {
        let size = this.gateParent.size();
        this.position = Vector.subtract(this.gateParent.position, Vector.multiply(size, 0.5));
    }
}

// handle mouse dragging of gates
Events.mousemove.push(e => {
    const button = Input.mouse.leftclick;
    if (!button.down) return; // this handler is only for dragging
    /**
     * @type {CustomGateUI?}
     */
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing Boards
    let hovered = findHoveredButton(button.path[button.path.length-2], Scene.currentScene.gateMenu);
    // console.log(hovered);
    if (!hovered || button.selected != hovered) return; // this event handler handles moving gates
    hovered.gateParent.position.add(button.path[button.path.length-2].to(button.path[button.path.length-1]));
    hovered.updateUI();
});

// handle mouse gate spawning
Events.mouseup.push(e => {
    const button = Input.mouse.leftclick;
    if (button.start.to(button.path[button.path.length-1]).sqrLength() > 20*20) return; // this handler handles clicks, not drags
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing boards
    if (!Utility.inRange(button.start.x, 100, 2460)) return; // this handler is for the gate-area part of the board
    if (findHoveredButton(button.start, UI) || findHoveredButton(button.start, Scene.currentScene.UI)) return; // this is for clicks on empty space
    createCustomGate(CustomGate.fromBoard(gateTypeByName(Scene.currentScene.selectedGateType), button.start), Scene.currentScene);
});

// handle mouse gate / bit deletion
Events.mouseup.push(e => {
    const button = Input.mouse.leftclick;
    const position = button.path[button.path.length-1];
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing boards
    if (!Input.keymap.Control) return; // only delete while the control key is pressed
    let hoveredItem = findHoveredButton(position, Scene.currentScene.gateMenu);
    if (hoveredItem) {
        deleteCustomGate(hoveredItem.gateParent, Scene.currentScene);
        // Scene.currentScene.gateMenu.removeButton(hoveredGate);
        return;
    }
    hoveredItem = findHoveredButton(position, Scene.currentScene.inputMenu);
    if (hoveredItem) {
        deleteBit(hoveredItem.bitParent, Scene.currentScene);
        // Scene.currentScene.inputs.splice(Scene.currentScene.inputs.indexOf(hoveredItem.bitParent), 1);
        return;
    }
    hoveredItem = findHoveredButton(position, Scene.currentScene.outputMenu);
    if (hoveredItem) {
        deleteBit(hoveredItem.bitParent, Scene.currentScene);
        // Scene.currentScene.outputs.splice(Scene.currentScene.outputs.indexOf(hoveredItem.bitParent), 1);
        return;
    }
});
Events.mousemove.push(e => {
    const button = Input.mouse.leftclick;
    if (!button.down) return; // only delete stuff if the mouse button is held down
    const position = button.path[button.path.length-1];
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing boards
    if (!Input.keymap.Control) return; // only delete while the control key is pressed
    let hoveredGate = findHoveredButton(position, Scene.currentScene.gateMenu);
    if (hoveredGate) {
        deleteCustomGate(hoveredGate.gateParent, Scene.currentScene);
        // Scene.currentScene.gateMenu.removeButton(hoveredGate);
    }
});

// handle connection drawing
Events.mouseup.push(e => {
    const button = Input.mouse.leftclick;
    const startPosition = button.start;
    const endPosition = button.path[button.path.length-1];
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing boards
    const startHover = findHoveredButton(startPosition, Scene.currentScene.UI);
    const endHover = findHoveredButton(endPosition, Scene.currentScene.UI);
    const allBits = Scene.currentScene.inputMenu.buttons.concat(Scene.currentScene.bitMenu.buttons, Scene.currentScene.outputMenu.buttons);
    if (!(startHover != endHover && allBits.includes(startHover) && allBits.includes(endHover))) return; // this event only handles dragging between two unique bits
    Scene.currentScene.connections.push(
        new Connection(startHover.bitParent, endHover.bitParent)
    );
});

// handle creating inputs / outputs
Events.mouseup.push(e => {
    const button = Input.mouse.leftclick;
    const start = button.start;
    const end = button.path[button.path.length-1];
    if (start.to(end).sqrLength() > 20*20) return; // don't handle drag events
    if (Utility.inRange(start.x, 100, 2460)) return; // only handle events near the edge
    if (!(Scene.currentScene instanceof Board)) return; // this handler is only for editing boards
    if (Input.keymap.Control) return; // don't create stuff while deleting
    if (findHoveredButton(start, Scene.currentScene.UI)) return; // don't create a bit over another UI element
    if (start.x < 100) Scene.currentScene.inputs.push(new Bit(start, ''));
    if (start.x > 2460) Scene.currentScene.outputs.push(new Bit(start, ''));
})
