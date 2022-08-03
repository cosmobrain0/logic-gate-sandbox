class Bit {
    static colourTrue = "#07f";
    static colourFalse = "#f30";
    static radius = 20;
    /**
     * 
     * @param {Vector} position global positoin for drawing
     * @param {Scene} scene the scene to add this bit to
     * @param {boolean} value 
     */
    constructor(position, scene, value) {
        this.position = position.copy();
        this.value = value ? true : false;
        this.label = CircleButton(
            scene.data.bitLabels, this.position.x, this.position.y, Bit.radius, this.value ? Bit.colourTrue : Bit.colourFalse, "#fff8", "", "#000", "30px Arial", [
                () => this.value = !this.value,
            ]
        );
    }

    draw(ctx) {
        this.label.renderer.bgcolour = this.value ? Bit.colourTrue : Bit.colourFalse;
        // ctx.beginPath();
        // ctx.fillStyle = this.value ? Bit.colourTrue : Bit.colourFalse;
        // ctx.arc(this.position.x, this.position.y, 20, 0, TWO_PI);
        // ctx.fill();
    }

    /**
     * 
     * @param {Vector} position 
     * @param {Scene} scene 
     * @returns {Bit}
     */
    static create(position, scene) {
        return new Bit(position, scene, false);
    }
}

class NandGate {
    static radius = 80;
    static name = "NAND";
    /**
     * 
     * @param {Vector} position global position for drawing
     * @param {Scene} scene the scene to add this gate to
     * @param {Bit?} a one input
     * @param {Bit?} b second input
     * @param {Bit?} q output
     */
    constructor(position, scene, a, b, q) {
        this.position = position.copy();
        this.a = a ? a : null;
        this.b = b ? b : null;
        this.q = q ? q : null;
        this.name = NandGate.name;
        this.label = CircleButton(
            scene.data.gateLabels, position.x, position.y, NandGate.radius, "#0000", "#0000", NandGate.name, "#000", "30px Arial", []
        );
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

    /**
     * 
     * @param {Vector} position 
     * @param {Scene} scene 
     * @returns {NandGate}
     */
    static create(position, scene) {
        let a = Bit.create(Vector.fromPolar( PI*3/4, NandGate.radius).add(position), scene);
        let b = Bit.create(Vector.fromPolar(-PI*3/4, NandGate.radius).add(position), scene);
        let c = Bit.create(new Vector(position.x+NandGate.radius, position.y), scene);
        let gate = new NandGate(position, scene, a, b, c);
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
    constructor(a, b, scene) {
        this.a = a;
        this.b = b;
        this.dead = false;
        scene.data.connections.filter(x => x.b == this.b).forEach(x => x.dead = true);
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
