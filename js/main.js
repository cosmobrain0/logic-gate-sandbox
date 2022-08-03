let gate = new BasicNandGate(new Vector(200, 200));
let bits = [
    new Bit(new Vector(100, 150), 'test input 1'),
    new Bit(new Vector(100, 250), 'test input 2'),
    new Bit(new Vector(300, 200), 'test output')
];
let connections = [
    new Connection(bits[0], gate.a),
    new Connection(bits[1], gate.b),
    new Connection(gate.out, bits[2])
];

let update = () => {
    gate.update();
    for (let connection of connections) connection.update();
}

bits[0].value = true;
bits[1].value = true;
for (let i=0; i<3; i++) update();
console.log(bits[2].value);

bits[0].value = true;
bits[1].value = false;
for (let i=0; i<3; i++) update();
console.log(bits[2].value);


bits[0].value = false;
bits[1].value = false;
for (let i=0; i<3; i++) update();
console.log(bits[2].value);

bits[0].value = false;
bits[1].value = true;
for (let i=0; i<3; i++) update();
console.log(bits[2].value);