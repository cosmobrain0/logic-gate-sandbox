/**
 * @typedef {Object} SceneOptions
 * @property {((scene: Scene) => void)?} init called once, the first time a transition to this scene occurs
 * @property {((scene: Scene) => void)?} cont called when this scene is active and is switched from paused to unpaused
 * @property {((scene: Scene) => void)?} restart called to reset the scene while it is active
 * @property {((scene: Scene) => void)?} pause called when the scene is active and is switched from unpaused to paused
 * @property {((scene: Scene) => void)?} end called when this scene is switching from active to inactive
 * @property {((scene: Scene) => void)?} calc called once every frame while this scene is active. Use this to update the game state
 * @property {((scene: Scene, ctx: CanvasRenderingContext2D) => void)?} draw could be called at any point while this scene is active. Should draw to the given `CanvasRenderingContext2D`
 */
/**
 * @typedef {Object} Canvas
 * @property {Number} width
 * @property {Number} height potato
 * @property {HTMLCanvasElement} c
 * @property {CanvasRenderingContext2D} ctx
 */
/**
 * @typedef {Object} MouseButton
 * @property {boolean} down true while this button is pressed
 * @property {Vector} start the position of the mouse the last time it was pressed
 * @property {Vector[]} path the path the mouse took the last time this button was held down
 * @property {Number?} identifier the identifier for touch input
 */
/**
 * @typedef {Object} Mouse
 * @property {Vector} position the current position
 * @property {MouseButton} leftclick information about the mouse left click button
 * @property {MouseButton} rightclick information about the mouse right click button
 * @property {Menu} selected the current selected menu
 * @property {MouseButton[]} touches
 */
/**
 * @typedef {Object} EventManager
 * @property {Function[]} mousemove
 * @property {Function[]} mousedown
 * @property {Function[]} mouseup
 * @property {Function[]} keydown
 * @property {Function[]} keyup
 * @property {Function[]} wheel
 * @property {Function[]} touchstart
 * @property {Function[]} touchmove
 * @property {Function[]} touchcancel
 * @property {Function[]} touchend
 */