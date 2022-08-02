let scenes = [];
scenes.push(
    new Scene({
        /**
         * 
         * @param {Scene} param0 
         */
        init: ({data, UI}) => {
            UI.addButton(RectangleButton(UI, 400, 450, 200, 100, "#555", "#fff8", "potato", "#fff", "30px Arial", [
                () => console.log("clicked"),
            ]));
            data.fpsCount = RectangleButton(UI, 100, 100, 0, 0, "#0000", "#0000", "", "#fff", "40px Arial", []);
            UI.addButton(data.fpsCount);
            data.mouseup = e => {
                console.log(Input.mouse);
                if (Input.mouse.leftclick.selected) {
                    console.log("UI interaction");
                } else {
                    console.log("game interaction");
                }
            }
            Events.mouseup.push(data.mouseup);
        },
        /**
         * 
         * @param {Scene} param0 
         */
        calc: ({data, UI}) => {
            UI.update(Input.mouse.position, Input.mouse.leftclick.down);
            data.fpsCount.renderer.text = `${floor(1000/Time.deltaTime)}`;
        },
        /**
         * 
         * @param {Scene} param0 
         * @param {CanvasRenderingContext2D} ctx 
         */
        draw: ({data, UI}, ctx) => {
            UI.draw(ctx);
            ctx.fillStyle = "#fff";
            let { position: mouse } = Input.mouse;
            ctx.fillRect(mouse.x-10, mouse.y-10, 20, 20);
        },
        /**
         * 
         * @param {Scene} param0 
         */
        end: ({data}) => {
            Events.mouseup.splice(Events.mouseup.indexOf(data.mouseup), 1);
        }
    }),
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
