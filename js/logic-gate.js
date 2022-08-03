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
    }

    update() {
        this.out.value = !(this.a.value && this.b.value);
    }
}

class CustomGate extends Board {

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
