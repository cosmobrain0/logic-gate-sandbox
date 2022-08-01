class Scene {
    /**
     * @type {Scene?}
     */
    static currentScene = null;
    /**
     * @type {Scene?}
     */
    static transitionFrom = null;
    /**
     * @type {Scene?}
     */
    static transitioningTo = null;
    /**
     * @type {SceneTransition}
     */
    static currentTransition = null;

    /**
     * 
     * @param {SceneOptions} options
     * @param {Object} data
     * @param {String[]} labels
     */
    constructor(options = {init:null, cont:null, restart:null, pause:null, end:null, calc:null, draw:null},
        data=null, ...labels
    ) {
        this.init = options.init == null ? Scene.defaultInit : options.init;
        this.cont = options.cont == null ? Scene.defaultCont : options.cont;
        this.restart = options.restart == null ? Scene.defaultRestart : options.restart;
        this.pause = options.pause == null ? Scene.defaultPause : options.pause;
        this.end = options.end == null ? Scene.defaultEnd : options.end;
        this.calc = options.calc == null ? Scene.defaultCalc : options.calc;
        this.draw = options.draw == null ? Scene.defaultDraw : options.draw;
        this.data = data == null ? {} : data;
        this.UI = new Menu(new Vector(0, 0), null, new Vector(Canvas.width, Canvas.height));
        this.requiresInit = true;
        this.requiresRestart = false;
        this.labels = labels.slice();
        this.transitioningIn = false;
        this.transitioningOut = false;
    }

    get transitioning() { return this.transitioningIn || this.transitioningOut; }

    static defaultInit() { /* do nothing */ }
    static defaultCont() { /* do nothing */ }
    static defaultRestart() { /* do nothing */ }
    static defaultPause() { /* do nothing */ }
    static defaultEnd() { /* do nothing */ }
    static defaultCalc() { /* do nothing */ }
    static defaultDraw(scene, ctx) { this.UI.draw(ctx); }

    /**
     * 
     * @param {Scene} scene 
     */
    static load(scene) {
        // decide if there should be a transition
        let transition = null;
        for (let transitionData of Scene.transitions) {
            let startSceneMatches = Scene.currentScene ? transitionData.start.every(value => Scene.currentScene.labels.includes(value)) : transitionData.start.every(value => value == 'NOSCENE');
            let endSceneMatches = transitionData.end.every(value => scene.labels.includes(value));
            if (startSceneMatches && endSceneMatches) {
                transition = transitionData;
                break;
            }
        }

        if (!transition) {
            Scene.immediateLoad(scene);
        } else {
            Scene.transitionFrom = Scene.currentScene;
            Scene.currentScene.transitioningOut = true;
            Scene.transitioningTo = scene;
            scene.transitioningIn = true;
            Scene.currentTransition = transition.toTransition();

            if (scene.requiresInit) {
                scene.requiresInit = false;
                scene.init(scene);
            }
            if (scene.requiresRestart) {
                scene.requiresRestart = false;
                scene.restart(scene);
            }
        }
    }

    /**
     * 
     * @param {Scene} scene 
     */
    static immediateLoad(scene) {
        if (Scene.transitionFrom) {
            Scene.transitionFrom.transitioningOut = false;
            Scene.transitionFrom = null;
        }
        if (Scene.transitioningTo) {
            Scene.transitioningTo.transitioningIn = false;
            Scene.transitioningTo = null;
        }
        Scene.currentTransition = null;
        if (Scene.currentScene) {
            Scene.currentScene.pause(Scene.currentScene);
            Scene.currentScene.end(Scene.currentScene);
        }
        Scene.currentScene = scene;
        if (Scene.currentScene.requiresInit) {
            Scene.currentScene.requiresInit = false;
            Scene.currentScene.init(Scene.currentScene);
        }
        if (Scene.currentScene.requiresRestart) {
            Scene.currentScene.requiresRestart = false;
            Scene.currentScene.restart(Scene.currentScene);
        }
    }

    /**
     * @type {SceneTransitionData[]}
     */
    static transitions = [];
}

class SceneTransitionData {
    /**
     * 
     * @param {String[]} start labels for the scene being unloaded
     * @param {String[]} end labels for the scene being loaded
     * @param {(start: Scene, end: Scene, transition: SceneTransition, ctx: CanvasRenderingContext2D) => boolean} handler draws the transition to the given ctx
     */
    constructor(start, end, handler) {
        this.start = start.slice();
        this.end = end.slice();
        this.handler = handler;
    }

    /**
     * @returns {SceneTransition}
     */
    toTransition() {
        return new SceneTransition(this.handler);
    }
}

class SceneTransition {
    /**
     * 
     * @param {(start: Scene, end: Scene, transition: SceneTransition, ctx: CanvasRenderingContext2D) => boolean} handler 
     */
    constructor(handler) {
        this.time = 0;
        // this.timeOfStart = Time.currentFrameTime;
        this.startCanvas = document.createElement('canvas');
        this.endCanvas = document.createElement('canvas');
        this.startCanvas.width = this.endCanvas.width = Canvas.width;
        this.startCanvas.height = this.endCanvas.height = Canvas.height;
        this.startContext = this.startCanvas.getContext('2d');
        this.endContext = this.endCanvas.getContext('2d');
        this.handler = handler;
    }

    // get time() { return Time.currentFrameTime - this.timeOfStart; }
}