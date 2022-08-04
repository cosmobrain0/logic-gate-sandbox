let board = new Board({
    /**
     * 
     * @param {Board} scene 
     */
    init: scene => {
        scene.inputs.push(
            new Bit(new Vector(100, 500), 'test input 0'),
            new Bit(new Vector(100, 900), 'test input 1')
        );
        scene.outputs.push(
            new Bit(new Vector(2460, 720), 'test output')
        );
        scene.gates.push(
            CustomGate.fromBoard(GATES[0], new Vector(2560/2, 1440/2))
        );
        scene.connections.push(
            new Connection(scene.inputs[0], scene.gates[0].inputs[0]),
            new Connection(scene.inputs[1], scene.gates[0].inputs[1]),
            new Connection(scene.gates[0].outputs[0], scene.outputs[0])
        );
    },
    /**
     * 
     * @param {Board} scene 
     */
    calc: scene => {
        // clamp input/output bit x-coordinates
        // bind CustomGate input/output bits to correct positions
        for (let gate of scene.gates) gate.update();
        for (let connection of scene.connections) connection.update();
    },
    /**
     * 
     * @param {Board} scene 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw: (scene, ctx) => {
        for (let input of scene.inputs) {
            drawBit(input, ctx);
        }
        for (let output of scene.outputs) {
            drawBit(output, ctx);
        }
        for (let connection of scene.connections) {
            drawConnection(connection, ctx);
        }
        for (let gate of scene.gates) {
            drawCustomGate(gate, ctx);
        }
    },
    end: scene => {

    }
}, [], 'global-board');
Scene.load(board);

/**
 * 
 * @param {Bit} bit 
 * @param {CanvasRenderingContext2D} ctx
 */
const drawBit = (bit, ctx) => {
    ctx.fillStyle = bit.value ? "#07f" : "#f30";
    ctx.beginPath();
    ctx.arc(bit.position.x, bit.position.y, 20, 0, TWO_PI);
    ctx.fill();
}

/**
 * 
 * @param {BasicNandGate} gate 
 * @param {CanvasRenderingContext2D} ctx 
 */
const drawNandGate = (gate, ctx) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(gate.position.x-50, gate.position.y-50, 100, 100);
}

/**
 * @param {CustomGate} gate
 * @param {CanvasRenderingContext2D} ctx
 */
const drawCustomGate = (gate, ctx) => {
    let size = gate.size(ctx);
    ctx.fillStyle = "#ccc";
    ctx.fillRect(gate.position.x-size.x/2, gate.position.y-size.y/2, size.x, size.y);
    ctx.fillStyle = "#000";
    ctx.fillText(gate.name, gate.position.x-size.x/2 + 20, gate.position.y+30/2);
    for (let bit of gate.inputs) drawBit(bit, ctx);
    for (let bit of gate.outputs) drawBit(bit, ctx);
}

/**
 * 
 * @param {Connection} connection 
 * @param {CanvasRenderingContext2D} ctx 
 */
const drawConnection = (connection, ctx) => {
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = connection.input.value ? "#07f" : "#f30";
    ctx.moveTo(connection.input.position.x, connection.input.position.y);
    ctx.lineTo(connection.output.position.x, connection.output.position.y);
    ctx.stroke();
}
