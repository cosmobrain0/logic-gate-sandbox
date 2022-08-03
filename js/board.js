class Board extends Scene {
    constructor(options, labels) {
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
    }

    update() {
        for (let connection of this.connections) connection.update();
        for (let gate of this.gates) gate.update();
    }
}

// custom gates
const GATES = [];
