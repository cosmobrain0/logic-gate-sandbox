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
            // for (let gate of gates) {
            //     gate.draw(ctx);
            // }
            for (let bit of bits) {
                bit.draw(ctx);
            }

            UI.draw(ctx);

            if (Input.keymap.Shift) {
                // deleting
                ctx.beginPath();
                ctx.strokeStyle = "#f00";
                ctx.lineWidth = 5;
                let position = Input.mouse.position.copy();
                ctx.moveTo(position.x-30, position.y-30);
                ctx.lineTo(position.x+30, position.y+30);
                ctx.moveTo(position.x+30, position.y-30);
                ctx.lineTo(position.x-30, position.y+30);
                ctx.stroke();
            } else {
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

/**
 * 
 * @param {Scene?} scene 
 * @returns {Bit[]}
 */
const bits = scene => (scene ? scene : Scene.currentScene).data.bits;
/**
 * 
 * @param {Scene?} scene 
 * @returns {Scene[]}
 */
const gates = scene => (scene ? scene : Scene.currentScene).data.gates;
/**
 * 
 * @param {Scene?} scene 
 * @returns {Connection[]}
 */
const connections = scene => (scene ? scene : Scene.currentScene).data.connections;
/**
 * 
 * @param {Scnee?} scene 
 * @returns 
 */
const data = scene => (scene ? scene : Scene.currentScene).data;

/**
 * 
 * @param {Circlebutton} label 
 * @param {Scene} scene 
 * @returns {Bit}
 */
const bitFromLabel = (label, scene) => data(scene).bits.filter(x => x.label == label)[0];
/**
 * 
 * @param {RectangleButton} label 
 * @param {Scene} scene 
 * @returns {NandGate}
 */
const gatefromLabel = (label, scene) => data(scene).gates.filter(x => x.label == label)[0];

Events.mouseup.push(e => {
    if (Scene.currentScene != scenes[0]) return; // this event is for scene[0]
    let button = Input.mouse.leftclick;
    let start = button.start;
    let end = button.path[button.path.length-1];

    if (findHoveredMenu(start, data().gatesMenu) || findHoveredMenu(end, data().gatesMenu)) return; // ignore menu stuffs

    let wasDragged = Input.mouse.leftclick.drag().length() > 10;
    
    if (wasDragged) {
        let startSelectedItem = findHoveredButton(start, Scene.currentScene.UI);
        let endSelectedItem = findHoveredButton(end, Scene.currentScene.UI);

        let startSelectedBit = data().bitLabels.buttons.includes(startSelectedItem) ? startSelectedItem : null;
        let startSelectedGate = data().gateLabels.buttons.includes(startSelectedItem) ? startSelectedItem : null;

        let endSelectedBit = data().bitLabels.buttons.includes(endSelectedItem) ? endSelectedItem : null;
        let endSelectedGate = data().gateLabels.buttons.includes(endSelectedItem) ? endSelectedItem : null;

        if (startSelectedBit && endSelectedBit && bitFromLabel(endSelectedBit).canReceiveInput) {
            data().connections.push(new Connection(bitFromLabel(startSelectedBit), bitFromLabel(endSelectedBit), Scene.currentScene));
            return; // created connection between two bits
        }

        if (startSelectedBit) {
            bitFromLabel(startSelectedBit).offset(Vector.subtract(end, start));
            return;
        }
        if (startSelectedGate) {
            gatefromLabel(startSelectedGate).offset(Vector.subtract(end, start));
            return;
        }
        return; // dealt with all drag events
    }

    // not dragged
    let selectedItem = findHoveredButton(start, Scene.currentScene.UI);

    let selectedBit = data().bitLabels.buttons.includes(selectedItem) ? selectedItem : null;
    let selectedGate = data().gateLabels.buttons.includes(selectedItem) ? selectedItem : null;

    if (Input.keymap.Shift) {
        if (selectedBit) {
            let bit = bitFromLabel(selectedBit, Scene.currentScene);
            Bit.destroy(bit, Scene.currentScene);
            return; // deleted a bit
        }
        if (selectedGate) {
            let gate = gatefromLabel(selectedGate, Scene.currentScene);
            switch (gate.name) {
                case NandGate.name:
                    NandGate.destroy(gate, Scene.currentScene);
                    break;
            }
            return; // deleted a gate
        }
        let selectedConnection = data().connections.filter(x => x.sqrDistanceTo(start) < 30)[0];
        if (selectedConnection) data().connections.splice(data().connections.indexOf(selectedConnection), 1);
        return; // deletions complete
    }

    // not deleting
    if (selectedBit || selectedGate) return; // a bit or gate was clicked on. We don't care

    if (data().gateSelected != null) {
        data().GATES[data().gateSelected].create(start, Scene.currentScene);
    } else {
        data().bits.push(Bit.create(start, Scene.currentScene));
    }
})
