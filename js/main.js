let scenes = [];
scenes.push(
    new Scene({
        init: ({data}) => {
            data.gates = [];
            data.connections = [];
            data.bits = [];
        },
        calc: ({data: {gates, connections, bits}}) => {
            for (let connection of connections) {
                connection.update();
            }
            for (let gate of gates) {
                gate.update();
            }
        },
        draw: ({data: {gates, connections, bits}}, ctx) => {
            for (let connection of connections) {
                connection.draw(ctx);
            }
            for (let gate of gates) {
                gate.draw(ctx);
            }
            for (let bit of bits) {
                bit.draw(ctx);
            }
        }
    }, {}, 'global')
)

Scene.load(scenes[0]);

const bits = scene => (scene ? scene : Scene.currentScene).data.bits;
const gates = scene => (scene ? scene : Scene.currentScene).data.gates;
const connections = scene => (scene ? scene : Scene.currentScene).data.connections;
const data = scene => (scene ? scene : Scene.currentScene).data;
