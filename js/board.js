class Board extends Scene {
    /**
     * 
     * @param {SceneOptions} options 
     * @param {String[]} labels 
     * @param {String} name
     */
    constructor(options, labels, name) {
        super(options, {}, ...labels);
        /**
         * @type {Bit[]}
         */
        this.inputs = [];
        /**
         * @type {Bit[]}
         */
        this.outputs = [];
        
        /**
         * @type {Bit[]}
         */
        this.bits = [];
        /**
         * @type {CustomGate[]}
         */
        this.gates = [];
        /**
         * @type {CustomGate[]}
         */
        this.connections = [];
        this.name = name;
    }

    update() {
        for (let connection of this.connections) connection.update();
        for (let gate of this.gates) gate.update();
    }

    findBitIndex(bit) {
        /**
         * @type {string?}
         */
        let listName = null;
        /**
         * @type {Number}
         */
        let bitIndex = -1;
        /**
         * @type {Number?}
         */
        let gateIndex = null;
        /**
         * @type {boolean?}
         */
        let isFromGateInput = null;
        if (this.inputs.includes(bit)) {
            listName = 'inputs';
            bitIndex = this.inputs.indexOf(bit);
        }
        if (this.outputs.includes(bit)) {
            listName = 'outputs';
            bitIndex = this.outputs.indexOf(bit);
        }
        if (this.bits.includes(bit)) {
            listName = 'bits';
            bitIndex = this.bits.indexOf(bit);
        }
        for (let i=0; i<this.gates.length; i++) {
            if (this.gates[i].inputs.includes(bit)) {
                // return gate input info
                gateIndex = i;
                isFromGateInput = true;
                bitIndex = this.gates[i].inputs.indexOf(bit);
                break;
            }
            if (this.gates[i].outputs.includes(bit)) {
                // return gate output info
                gateIndex = i;
                isFromGateInput = false;
                bitIndex = this.gates[i].outputs.indexOf(bit);
                break;
            }
        }
        return {
            listName, bitIndex, gateIndex, isFromGateInput
        };
    }
}


class CustomGate extends Board {
    /**
     * 
     * @param {SceneOptions} options 
     * @param {String[]} labels 
     * @param {String} name
     * @param {Vector} position 
     */
    constructor(options, labels, name, position) {
        super(options, labels, name);
        this.position = position.copy();
        // TODO: will require an update when custom gates are rendered (probably)
    }

    update() {
        for (let connection of this.connections) connection.update();
        for (let gate of this.gates) gate.update();
        // TODO: set input/output positions
        for (let i=0; i<this.inputs.length; i++) {
            let y = this.position.y + (i - this.inputs.length/2 + 0.5) * 50;
            let x = this.position.x - this.size(Canvas.ctx).x/2;
            this.inputs[i].position = new Vector(x, y);
        }
        for (let i=0; i<this.outputs.length; i++) {
            let y = this.position.y + (i - this.outputs.length/2 + 0.5) * 50;
            let x = this.position.x + this.size(Canvas.ctx).x/2;
            this.outputs[i].position = new Vector(x, y);
        }
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    size(ctx) {
        ctx.font = "30px Arial";
        let textDetails = ctx.measureText(this.name);
        return new Vector(
            textDetails.width + 40,
            max(
                (textDetails.actualBoundingBoxAscent+textDetails.actualBoundingBoxDescent) + 20,
                (this.inputs.length-1)*50 + 50,
                (this.outputs.length-1)*50 + 50
            )
        );
    }

    /**
     * 
     * @param {Board} board 
     */
    static fromBoard(board, position) {
        let gate = new CustomGate(board.options, board.labels, board.name, position);
        for (let input of board.inputs) {
            gate.inputs.push(input.copy());
            gate.inputs[gate.inputs.length-1].position = gate.position.copy();
        }
        for (let bit of board.bits) {
            gate.bits.push(bit.copy());
            gate.bits[gate.bits.length-1].position = gate.position.copy();
        }
        for (let customGate of board.gates) {
            gate.gates.push(customGate.copy());
            gate.gates[gate.gates.length-1].position = position.copy();
        }
        for (let output of board.outputs) {
            gate.outputs.push(output.copy());
            gate.outputs[gate.outputs.length-1].position = position.copy();
        }
        for (let connection of board.connections) {
            let inputData = board.findBitIndex(connection.input);
            let outputData = board.findBitIndex(connection.output);
            /**
             * @type {Bit}
             */
            let input;
            /**
             * @type {Bit}
             */
            let output;

            if (inputData.gateIndex == null) {
                input = gate[inputData.listName][inputData.bitIndex];
            } else {
                input = gate.gates[inputData.gateIndex][inputData.isFromGateInput ? "inputs" : "outputs"][inputData.bitIndex];
            }
            if (outputData.gateIndex == null) {
                output = gate[outputData.listName][outputData.bitIndex];
            } else {
                output = gate.gates[outputData.gateIndex][outputData.isFromGateInput ? "inputs" : "outputs"][outputData.bitIndex];
            }
            gate.connections.push(new Connection(input, output));
        }
        return gate;
    }

    copy() {
        return CustomGate.fromBoard(this, this.position.copy()); // TODO: will require an update when custom gates are rendered (probably)
    }
}

// custom gates
/**
 * @type {Board[]}
 */
const GATES = [];

// set up NAND CustomGate
{
    let NandGate = new Board({}, [], 'NAND');
    NandGate.inputs.push(new Bit(new Vector(0, 100), 'A'));
    NandGate.inputs.push(new Bit(new Vector(0, 200), 'B'));
    NandGate.outputs.push(new Bit(new Vector(0, 150), 'OUT'));
    NandGate.gates.push(new BasicNandGate(new Vector(0, 150)));
    NandGate.connections.push(
        new Connection(NandGate.inputs[0], NandGate.gates[0].a),
        new Connection(NandGate.inputs[1], NandGate.gates[0].b),
        new Connection(NandGate.gates[0].out, NandGate.outputs[0])
    );
    GATES.push(CustomGate.fromBoard(NandGate, new Vector(0, 0)));
}
