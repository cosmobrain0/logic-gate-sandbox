let board = new Board({
    /**
     * 
     * @param {Board} scene 
     */
    init: scene => {
    },
    /**
     * 
     * @param {Board} scene 
     */
    calc: scene => {
        // create any missing UI elements
        for (let bit of scene.inputs) {
            if (!scene.inputMenu.buttons.reduce((foundLabel, currentLabel) => foundLabel || currentLabel.bitParent == bit, false)) {
                scene.inputMenu.addButton(new BitUI(bit));
            }
        }
        for (let bit of scene.outputs) {
            if (!scene.outputMenu.buttons.reduce((foundLabel, currentLabel) => foundLabel || currentLabel.bitParent == bit, false)) {
                scene.outputMenu.addButton(new BitUI(bit));
            }
        }
        for (let bit of scene.bits) {
            if (!scene.bitMenu.buttons.reduce((foundLabel, currentLabel) => foundLabel || currentLabel.bitParent == bit, false)) {
                scene.bitMenu.addButton(new BitUI(bit));
            }
        }
        for (let gate of scene.gates) {
            if (!scene.gateMenu.buttons.reduce((foundLabel, currentLabel) => foundLabel || currentLabel.gateParent == gate, false)) {
                scene.gateMenu.addButton(new CustomGateUI(gate));
            }
        }

        // delete unnecessary UI elements
        for (let i=scene.bitMenu.buttons.length-1; i>=0; i--) {
            if (!scene.bits.includes(scene.bitMenu.buttons[i].bitParent)) scene.bitMenu.removeButton(scene.bitMenu.buttons[i]);
        }
        for (let i=scene.inputMenu.buttons.length-1; i>=0; i--) {
            if (!scene.inputs.includes(scene.inputMenu.buttons[i].bitParent)) scene.inputMenu.removeButton(scene.inputMenu.buttons[i]);
        }
        for (let i=scene.outputMenu.buttons.length-1; i>=0; i--) {
            if (!scene.outputs.includes(scene.outputMenu.buttons[i].bitParent)) scene.outputMenu.removeButton(scene.outputMenu.buttons[i]);
        }
        for (let i=scene.gateMenu.buttons.length-1; i>=0; i--) {
            if (!scene.gates.includes(scene.gateMenu.buttons[i].gateParent)) scene.gateMenu.removeButton(scene.gateMenu.buttons[i]);
        }

        // TODO: clamp input/output bit x-coordinates
        for (let bit of scene.inputs) bit.position.x = 100;
        for (let bit of scene.outputs) bit.position.x = 2460;
        // TODO: bind CustomGate input/output bits to correct positions

        for (let gate of scene.gates) gate.update();
        for (let connection of scene.connections) connection.update();

        // update UI elements
        for (let bitUI of scene.inputMenu.buttons) bitUI.updateUI();
        for (let bitUI of scene.outputMenu.buttons) bitUI.updateUI();
        for (let gateUI of scene.gateMenu.buttons) gateUI.updateUI();
        for (let bitUI of scene.bitMenu.buttons) bitUI.updateUI();
        scene.UI.update(Input.mouse.leftclick.start, Input.mouse.position, false);
    },
    /**
     * 
     * @param {Board} scene 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw: (scene, ctx) => {
        const button = Input.mouse.leftclick;
        scene.UI.draw(ctx);
        scene.gateMenu.draw(ctx);
        for (let connection of scene.connections) {
            drawConnection(connection, ctx);
        }
        if (button.down && scene.inputMenu.buttons.concat(scene.outputMenu.buttons, scene.bitMenu.buttons).includes(button.selected)) {
            ctx.strokeStyle = button.selected.bitParent.value ? BitUI.trueColour : BitUI.falseColour;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(button.selected.position.x, button.selected.position.y);
            ctx.lineTo(button.path[button.path.length-1].x, button.path[button.path.length-1].y);
            ctx.stroke();
        }
        scene.bitMenu.draw(ctx);
        scene.inputMenu.draw(ctx);
        scene.outputMenu.draw(ctx);
        let currentPosition = Input.mouse.position;
        if (!Utility.inRange(currentPosition.x, 100, 2460) && !findHoveredButton(currentPosition, scene.inputMenu) && !findHoveredButton(currentPosition, scene.outputMenu)) {
            ctx.fillStyle = "#555";
            ctx.beginPath();
            ctx.arc(Utility.clamp(currentPosition.x, 100, 2460), currentPosition.y, BitUI.radius, 0, TWO_PI);
            ctx.fill();
        }
    },
    end: scene => {

    }
}, [], 'global-board');
Scene.load(board);

/**
 * 
 * @param {Connection} connection 
 * @param {CanvasRenderingContext2D} ctx 
 */
const drawConnection = (connection, ctx) => {
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = connection.input.value ? BitUI.trueColour : BitUI.falseColour;
    ctx.moveTo(connection.input.position.x, connection.input.position.y);
    ctx.lineTo(connection.output.position.x, connection.output.position.y);
    ctx.stroke();
}

/**
 * @param {CustomGate} gate
 * @param {Board} scene
 */
const deleteCustomGate = (gate, scene) => {
    scene.gates.splice(scene.gates.indexOf(gate), 1);
    // for (let i=scene.connections.length-1; i>=0; i--) {
    //     if (gate.inputs.includes(scene.connections[i].output) || gate.outputs.includes(scene.connections[i].input)) {
    //         scene.connections.splice(i, 1);
    //     }
    // }
    // for (let bit of gate.inputs) scene.bits.splice(scene.bits.indexOf(bit), 1);
    // for (let bit of gate.outputs) scene.bits.splice(scene.bits.indexOf(bit), 1);
    for (let bit of gate.inputs.concat(gate.outputs)) deleteBit(bit, scene);
}

/**
 * 
 * @param {Bit} bit 
 * @param {Board} scene 
 */
const deleteBit = (bit, scene) => {
    if (scene.bits.includes(bit)) scene.bits.splice(scene.bits.indexOf(bit), 1);
    if (scene.inputs.includes(bit)) scene.inputs.splice(scene.inputs.indexOf(bit), 1);
    if (scene.outputs.includes(bit)) scene.outputs.splice(scene.outputs.indexOf(bit), 1);
    for (let i=scene.connections.length-1; i>=0; i--) {
        if (bit == scene.connections[i].output || bit == scene.connections[i].input) {
            scene.connections.splice(i, 1);
        }
    }
}

/**
 * 
 * @param {CustomGate} gate 
 * @param {Board} scene 
 */
const createCustomGate = (gate, scene) => {
    scene.gates.push(gate);
    scene.bits = scene.bits.concat(gate.inputs, gate.outputs);
}
