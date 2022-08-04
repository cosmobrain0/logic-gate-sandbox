class Bit {
    /**
     * 
     * @param {Vector} position 
     * @param {String} name 
     */
    constructor(position, name) {
        this.position = position.copy();
        this.name = name;
        this.value = false;
        this.canGetInput = true;
        this.canGiveOutput = true;
    }

    copy() {
        let bit = new Bit(this.position.copy(), this.name);
        bit.value = this.value;
        bit.canGetInput = this.canGetInput;
        bit.canGiveOutput = this.canGiveOutput;
        return bit;
    }
}

class BasicNandGate {
    /**
     * 
     * @param {Vector} position 
     */
    constructor(position) {
        this.position = position.copy();
        this.a = new Bit(position.copy(), 'A');
        this.b = new Bit(position.copy(), 'B');
        this.out = new Bit(position.copy(), 'OUT');
        this.a.canGiveOutput = false;
        this.b.canGiveOutput = false;
        this.out.canGetInput = false;
        this.inputs = [this.a, this.b];
        this.outputs = [this.out];
        this.bits = [];
        this.gates = [];
        this.connections = [];
    }

    update() {
        this.out.value = !(this.a.value && this.b.value);
    }

    copy() {
        return new BasicNandGate(this.position.copy());
    }
}

class Connection {
    /**
     * 
     * @param {Bit} input 
     * @param {Bit} output 
     */
    constructor(input, output) {
        if (!input.canGiveOutput || !output.canGetInput) {
            console.warn('Error when creating Connection');
            console.warn(input);
            console.warn(output);
            throw new Error("Can't create connection between these two Bits");
        }
        this.input = input;
        this.output = output;
    }

    update() {
        this.output.value = this.input.value;
    }
}
