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
        this.canReceiveInput = true;
    }

    draw(ctx) {
        this.label.renderer.bgcolour = this.value ? Bit.colourTrue : Bit.colourFalse;
        // ctx.beginPath();
        // ctx.fillStyle = this.value ? Bit.colourTrue : Bit.colourFalse;
        // ctx.arc(this.position.x, this.position.y, 20, 0, TWO_PI);
        // ctx.fill();
    }

    /**
     * moves the bit
     * @param {Vector} offset how much to move
     */
    offset(offset) {
        this.position.add(offset);
        this.label.position.add(offset);
    }

    /**
     * sets the position
     * @param {Vector} position the new position
     */
    setPosition(position) {
        this.offset(this.position.to(position));
    }

    /**
     * 
     * @param {Vector} position 
     * @param {Scene} scene 
     * @returns {Bit}
     */
    static create(position, scene) {
        let bit = new Bit(position, scene, false);
        scene.data.bits.push(bit);
        return bit;
    }

    /**
     * 
     * @param {Bit} bit 
     * @param {Scene} scene 
     */
    static destroy(bit, scene) {
        scene.data.bitLabels.removeButton(bit.label);
        scene.data.bits.splice(scene.data.bits.indexOf(bit), 1);
        for (let i=scene.data.connections.length-1; i>=0; i--) {
            if (scene.data.connections[i].a == bit || scene.data.connections[i].b == bit) {
                scene.data.connections[i].dead = true;
            }
        }
    }
}

class NandGate {
    static width = 140;
    static height = 80;
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
        this.label = RectangleButton(
            scene.data.gateLabels, position.x-NandGate.width/2, position.y-NandGate.height/2, NandGate.width, NandGate.height, "#ccc", "#0000", NandGate.name, "#000", "30px Arial", []
        );
        if (this.q) this.q.canReceiveInput = false;
    }

    update() {
        this.a.setPosition(new Vector(-NandGate.width/2, -NandGate.height*0.4).add(this.position));
        this.b.setPosition(new Vector(-NandGate.width/2, NandGate.height*0.4).add(this.position));
        this.q.setPosition(new Vector(NandGate.width/2, 0).add(this.position));
        this.q.value = !((this.a!=null && this.a.value) && (this.b!=null && this.b.value));
    }

    /**
     * moves the gate
     * @param {Vector} offset how much to move
     */
    offset(offset) {
        this.a.offset(offset);
        this.b.offset(offset);
        this.q.offset(offset);
        this.label.position.add(offset);
        this.position.add(offset);
    }

    /**
     * 
     * @param {Vector} position 
     * @param {Scene} scene 
     * @returns {NandGate}
     */
    static create(position, scene) {
        let a = Bit.create(new Vector(-NandGate.width/2, -NandGate.height*0.4).add(position), scene);
        let b = Bit.create(new Vector(-NandGate.width/2, NandGate.height*0.4).add(position), scene);
        let c = Bit.create(new Vector(NandGate.width/2, 0).add(position), scene);
        let gate = new NandGate(position, scene, a, b, c);
        // scene.data.bits.push(a, b, c);
        scene.data.gates.push(gate);
        return gate;
    }

    /**
     * 
     * @param {NandGate} gate 
     * @param {Scene} scene 
     */
    static destroy(gate, scene) {
        Bit.destroy(gate.a, scene);
        Bit.destroy(gate.b, scene);
        Bit.destroy(gate.q, scene);
        scene.data.gateLabels.removeButton(gate.label);
        scene.data.gates.splice(scene.data.gates.indexOf(gate), 1);
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

    /**
     * 
     * @param {Vector} point 
     */
    sqrDistanceTo(point) {
        let p1 = this.a.position;
        let p2 = this.b.position;

        let m1 = (p1.y-p2.y) / (p1.x-p2.x);
        let c1 = p1.y - m1*p1.x;
        let m2 = -1/m1;
        let c2 = point.y - m2*point.x;

        let x = Utility.clampUnordered((c2-c1)/(m1-m2), p1.x, p2.x);
        let y = m1*x + c1;

        return point.sqrDistanceTo(new Vector(x, y));
    }
}
