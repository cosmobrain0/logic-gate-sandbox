/**
 * @typedef {Object} Bit
 * @property {string} name the name of this bit
 * @property {Vector} position the global position of the bit on the board
 * @property {boolean} value the value of this bit
 */

/**
 * @typedef {Object} BasicNandGate
 * @property {Bit} a one input
 * @property {Bit} b one input
 * @property {Bit} out output
 * @property {Vector} position the global position of the centre of the gate on the board
 */

/**
 * @typedef {Scene} Board
 * @property {Bit[]} inputs bits which are used as inputs if this Board is converted to a CustomGate
 * @property {Bit[]} outputs bits which are used as outputs if this Board is converted to a CustomGate
 * @property {Bit[]} bits bits involved in the inner workings of this board
 * @property {CustomGate[]} gates gates involved in the inner workings of this board
 * @property {Connection[]} connections connections involved in the inner workings of this board
 */

/**
 * @typedef {Board} CustomGate
 * @property {CustomGate[]} gates gates invollved in the iner workings of this CustomGate
 * @property {BasicNandGate} nandgates BasicNandGates involved in the inner workings of this CustomGate
 */

/**
 * @typedef {Object} Connection
 * @property {Bit} input source
 * @property {Bit} output output
 * @method update
 */
