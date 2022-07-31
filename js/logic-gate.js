class Bit {
    static colourTrue = "#07f";
    static colourFalse = "#f30";
    /**
     * 
     * @param {Vector} position global positoin for drawing
     * @param {boolean} value 
     */
    constructor(position, value) {
        this.position = position.copy();
        this.value = value ? true : false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.value ? Bit.colourTrue : Bit.colourFalse;
        ctx.arc(this.position.x, this.position.y, 20, 0, TWO_PI);
        ctx.fill();
    }
}

class NandGate {
    static radius = 50;
    /**
     * 
     * @param {Vector} position global position for drawing
     * @param {Bit?} a one input
     * @param {Bit?} b second input
     * @param {Bit?} q output
     */
    constructor(position, a, b, q) {
        this.position = position.copy();
        this.a = a ? a : null;
        this.b = b ? b : null;
        this.q = q ? q : null;
    }

    update() {
        this.q.value = !((this.a!=null && this.a.value) && (this.b!=null && this.b.value));
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#ccc";
        ctx.arc(this.position.x, this.position.y, NandGate.radius, 0, TWO_PI);
        ctx.fill();
    }

    static create(position, scene) {
        let a = new Bit(new Vector(position.x-NandGate.radius, position.y-NandGate.radius*0.8), false);
        let b = new Bit(new Vector(position.x-NandGate.radius, position.y+NandGate.radius*0.8), false);
        let c = new Bit(new Vector(position.x+NandGate.radius, position.y), false);
        let gate = new NandGate(position, a, b, c);
        scene.data.bits.push(a, b, c);
        scene.data.gates.push(gate);
        return gate;
    }
}

class Connection {
    /**
     * a one-directional connection
     * @param {Bit} a start
     * @param {Bit} b end
     */
    constructor(a, b) {
        this.a = a;
        this.b = b;
        this.dead = false;
    }

    update() {
        if (this.a && this.b) {
            this.b.value = this.a.value;
        } else {
            // one end of this connection is null
            this.dead = true; // flag to be deleted
        }
    }

    draw(ctx) {
        ctx.strokeStyle = this.a.value ? Bit.colourTrue : Bit.colourFalse;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.a.position.x, this.a.position.y);
        ctx.lineTo(this.b.position.x, this.b.position.y);
        ctx.stroke();
    }
}
