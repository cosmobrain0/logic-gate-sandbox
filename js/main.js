/**
 * @type {Scene[]}
 */
let scenes = [];
let currentSceneIndex = 0;
scenes.push(
    new Scene({
        init: ({data}) => {
            data.time = 0;
            data.radius = Utility.map(sin(data.time/1000), -1, 1, 30, 300);
            // console.log('loading circle');
        },
        calc: ({data, transitioningIn}) => {
            if (transitioningIn) return;
            data.time += Time.deltaTime;
            data.radius = Utility.map(sin(data.time/1000), -1, 1, 30, 300);
        },
        draw: ({data: {radius}}, ctx) => {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(Canvas.width/2, Canvas.height/2, radius, 0, TWO_PI);
            ctx.fill();
        },
        // end: () => console.log('unloading circle')
    }, {radius: 30, time: 0}, 'circle'),

    new Scene({
        init: ({data}) => {
            // console.log('loading rectangle');
            data.particles = new Array(5).fill(0).map(x => Vector.random(0, Canvas.width, 0, Canvas.height));
            data.time = 0;
        },
        calc: ({data, transitioningOut}) => {
            if (transitioningOut) return;
            data.time += Time.deltaTime;
        },
        draw: ({data: {particles, time}}, ctx) => {
            ctx.fillStyle = "#555";
            ctx.fillRect(0, 0, Canvas.width, Canvas.height);
            ctx.fillStyle = "#fff";
            for (let {x, y} of particles) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(time/1000);
                ctx.fillRect(-20, -20, 40, 40);
                ctx.restore();
            }
        },
        end: scene => {
            scene.requiresInit = true;
            // console.log('unloading rectangle');
        }
    }, {}, 'rectangle')
);

Scene.transitions.push(
    new SceneTransitionData(['rectangle'], ['circle'], (start, end, transition, ctx) => {
        const { clamp, map } = Utility;
        // ctx.globalAlpha = clamp(map(transition.time, 0, 2000, 1, 0), 0, 1) ** 2;
        // start.draw(start, ctx);
        // ctx.globalAlpha = clamp(map(transition.time, 0, 2000, 0, 1), 0, 1) ** 2;
        // end.draw(end, ctx);
        {
            let ctx = transition.startContext;
            ctx.fillStyle = "rgb(71, 214, 95)";
            let radius = easeOutCubic(clamp(map(transition.time, 0, 500, 0, 1), 0, 1)) * 100;
            // let radius = clamp(map(transition.time, 0, 500, 0, 100), 0, 100);
            ctx.beginPath();
            ctx.arc(Canvas.width/2, Canvas.height/2, radius, 0, TWO_PI);
            ctx.fill();
            
            let progress = easeOutCubic(clamp(map(transition.time, 500, 800, 0, 1), 0, 1));
            let width = Canvas.width/2 * progress;
            let thickness = 30 * progress;
            // ctx.beginPath();
            // ctx.moveTo(Canvas.width/2 - width, Canvas.height/2);
            // ctx.lineTo(Canvas.height/2 + width, Canvas.height/2);
            // ctx.stroke();
            ctx.fillRect(Canvas.width/2 - width, Canvas.height/2 - thickness/2, width*2, thickness);
        }

        ctx.putImageData(transition.endContext.getImageData(0, 0, Canvas.width, Canvas.height), 0, 0);
        let yOffset = transition.endCanvas.height/2 * easeInOutCubic(clamp(map(transition.time, 800, 2000, 0, 1), 0, 1));
        ctx.putImageData(
            transition.startContext.getImageData(0, 0, transition.startCanvas.width, transition.startCanvas.height/2),
            0, -yOffset
        );
        ctx.putImageData(
            transition.startContext.getImageData(0, transition.startCanvas.height/2, transition.startCanvas.width, transition.startCanvas.height/2),
            0, transition.startCanvas.height/2 + yOffset
        );
        return transition.time > 2000;
    }),

    new SceneTransitionData(['circle'], ['rectangle'], (start, end, transition, ctx) => {
        const { clamp, map } = Utility;
        let progress = easeInOutCubic(transition.time / 4000);
        let width = Canvas.c.width, height = Canvas.c.height;
        let thickness = 500;
        let screenX = map(progress, 0, 1, -Canvas.height/2 - thickness, Canvas.width+Canvas.height/2 + thickness);
        let x = clamp(map(screenX, 0, Canvas.width, 0, width), 0, width);
        let startImage = transition.startContext.getImageData(x, 0, width, height);
        let endImage = transition.endContext.getImageData(x-width, 0, width, height);
        // ctx.putImageData((progress < 0.5 ? transition.startContext : transition.endContext).getImageData(0, 0, Canvas.c.width, Canvas.c.height), 0, 0);
        ctx.putImageData(startImage, x, 0);
        ctx.putImageData(endImage, x-width, 0);
        ctx.fillStyle = "rgb(71, 214, 95)";
        thickness += Canvas.height/2;
        ctx.beginPath();
        ctx.arc(screenX, Canvas.height/2, Canvas.height/2, -HALF_PI, HALF_PI);
        ctx.lineTo(screenX-thickness, Canvas.height);
        ctx.arc(screenX-thickness, Canvas.height/2, Canvas.height/2, HALF_PI, -HALF_PI, true);
        ctx.fill();
        return progress > 1;
    })
);

const easeOutCubic = x => {
    return 1 - Math.pow(1 - x, 3);
}

const easeInOutCubic = x => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

Events.keyup.push(e => {
    if (e.key == ' ') {
        currentSceneIndex = currentSceneIndex == 0 ? 1 : 0;
        Scene.load(scenes[currentSceneIndex]);
    }
})
