class Board extends Scene {
    constructor(options, labels) {
        super(options, {}, ...labels);
        /**
         * @type {Bit}
         */
        this.inputs = [];
    }
}


// custom gates
const GATES = [];
