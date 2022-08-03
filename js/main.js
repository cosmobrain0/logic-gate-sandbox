let scenes = [];
scenes.push(
    new Scene({
        /**
         * 
         * @param {Scene} param0 
         */
        init: ({data, UI}) => {
            let menu = new Menu(new Vector(0, 0), UI, new Vector(500, Canvas.height));
            UI.addMenu(menu);
            data.gatesMenu = menu;
            data.gateSelected = 0;
            data.GATES = [
                NandGate
            ];
            Object.freeze(data.GATES);
            let buttons = [
                ["BIT", [
                    () => data.gateSelected = null
                ]],
                ["NAND", [
                    () => data.gateSelected = 0
                ]],
            ]
            for (let i=0; i<buttons.length; i++) {
                menu.addButton(RectangleButton(menu, 20, 20 + i*120, 460, 100, "#000", "#fff5", buttons[i][0], "#ccc", "50px Arial", buttons[i][1].slice()));
            }
            data.gates = [];
            data.connections = [];
            data.bits = [];
            data.bitLabels = new Menu(new Vector(0, 0), UI, new Vector(0, 0));
            data.gateLabels = new Menu(new Vector(0, 0), UI, new Vector(0, 0)); // for gate labels
        },
        /**
         * 
         * @param {Scene} param0 
         */
        calc: ({data, UI}) => {
            UI.update(Input.mouse.position, Input.mouse.position, false);
            for (let gate of data.gates) gate.update();
            for (let i=data.connections.length-1; i>=0; i--) {
                data.connections[i].update();
                if (data.connections[i].dead) data.connections.splice(i, 1);
            }
        },
        /**
         * 
         * @param {Scene} param0 
         * @param {CanvasRenderingContext2D} ctx 
         */
        draw: ({data: { gatesMenu, gateSelected, GATES, connections, gates, bits, }, UI}, ctx) => {
            ctx.fillStyle = "#666";
            ctx.fillRect(0, 0, Canvas.width, Canvas.height);

            ctx.fillStyle = "#5553";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 5;
            ctx.fillRect(gatesMenu.position.x, gatesMenu.position.y, gatesMenu.collider.size.x, gatesMenu.collider.size.y);
            ctx.beginPath();
            ctx.moveTo(gatesMenu.position.x+gatesMenu.collider.size.x, gatesMenu.position.y);
            ctx.lineTo(gatesMenu.position.x+gatesMenu.collider.size.x, gatesMenu.position.y+gatesMenu.collider.size.y);
            ctx.stroke();

            for (let connection of connections) {
                connection.draw(ctx);
            }
            for (let gate of gates) {
                gate.draw(ctx);
            }
            for (let bit of bits) {
                bit.draw(ctx);
            }

            UI.draw(ctx);

            ctx.fillStyle = "#fff";
            let { position: mouse } = Input.mouse;
            if (gateSelected == null) {
                ctx.fillRect(mouse.x-10, mouse.y-10, 20, 20);
            } else {
                ctx.font = "40px Arial";
                ctx.fillText(GATES[gateSelected].name, mouse.x, mouse.y+40);
            }

            if (Input.mouse.leftclick.down) {
                ctx.beginPath();
                ctx.strokeStyle = "#000";
                ctx.lineWidh = 5;
                let path = Input.mouse.leftclick.path;
                ctx.moveTo(Input.mouse.leftclick.start.x, Input.mouse.leftclick.start.y);
                ctx.lineTo(path[path.length-1].x, path[path.length-1].y);
                ctx.stroke();
            }
        },
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

Events.mouseup.push(e => {
    if (Scene.currentScene != scenes[0]) return; // this event is for scene[0]
    let button = Input.mouse.leftclick;
    if (button.selected) {
        let startHover = findHoveredButton(button.start, Scene.currentScene.UI);
        let endHover = findHoveredButton(button.path[button.path.length-1], Scene.currentScene.UI);
        console.log(startHover);
        console.log(endHover);
        if (startHover == endHover) return; // rely on button events to handle clicking UI elements
        if (data().bitLabels.buttons.includes(startHover) && data().bitLabels.buttons.includes(endHover)) {
            // line between two bits: make a connection
            data().connections.push(new Connection(data().bits.filter(x => x.label == startHover)[0], data().bits.filter(x => x.label == endHover)[0], Scene.currentScene))
            return;
        }
    }
    if (!findHoveredMenu(button.start, data().gatesMenu) && !findHoveredMenu(button.path[button.path.length-1], data().gatesMenu)) {
        // this event is only triggered for mouse events on the game board (not on the menu to the right)
        let position = button.path[button.path.length-1];
        if (data().gateSelected != null) {
            console.log(data().GATES[data().gateSelected]);
            data().gates.push(data().GATES[data().gateSelected].create(position, Scene.currentScene));
        } else {
            data().bits.push(Bit.create(position, Scene.currentScene));
        }
    }
})
