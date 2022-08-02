const Utility = {
    // thanks to https://stackoverflow.com/questions/28036652/finding-the-shortest-distance-between-two-angles/28037434
    // for this function
    /**
     * 
     * @param {Number} theta1 
     * @param {Number} theta2 
     * @returns {Number} the (signed) shortest distance between the angles
     */
    shortestAngleDist: (theta1, theta2) => {
        let diff = (theta2 - theta1 + Math.PI) % (2 * Math.PI) - Math.PI;
        return diff < -Math.PI ? diff + 2 * Math.PI : diff;
    },

    /**
     * the position of the mouse on the webpage
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Vector} the position of the mouse on canvas
     */
    adjustMousePosition: (x, y) => {
        let screenPixelWidth = Canvas.c.style.width;
        screenPixelWidth = parseInt(screenPixelWidth.slice(0, screenPixelWidth.length-2));
        let screenPixelHeight = Canvas.c.style.height;
        screenPixelHeight = parseInt(screenPixelHeight.slice(0, screenPixelHeight.length-2));
        let position = new Vector(x - (window.innerWidth - screenPixelWidth) / 2, y - (window.innerHeight - screenPixelHeight) / 2);
        position.x /= screenPixelWidth / Canvas.width;
        position.y /= screenPixelHeight / Canvas.height;
        // position.calculatePolar();
        return position;
    },

    /**
     * Adjusts the size of the canvas to fill the screen
     * while maintaing the same aspect ratio (defined by CANVASWIDTH and CANVASHEIGHT)
     */
    adjustSize: (c, ctx) => {
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / Canvas.width * Canvas.height > height) width = Math.floor(height / Canvas.height * Canvas.width);
        else height = Math.floor(width / Canvas.width * Canvas.height);
        c.width = Canvas.width;
        c.height = Canvas.height;
        c.style.width = `${floor(width)}px`;
        c.style.height = `${floor(height)}px`;
        c.style.left = `${(window.innerWidth - width) / 2}px`;
        c.style.top = `${(window.innerHeight - height) / 2}px`;
    },

    /**
     * 
     * @param {Number} value the value to clamp
     * @param {Number} min the lowest possible value returned
     * @param {Number} max the highest possible value returned
     * @returns {Number} the result of clamping the value
     */
    clamp: (value, min, max) => Math.max(Math.min(value, max), min),

    /**
     * allows you to clamp a value in a range without specifying which bound is the upper boudn and which is the lower bound
     * @param {Number} value the value to clamp
     * @param {Number} b1 the highest or lowest value
     * @param {Number} b2 the highest or lowest (opposite of b1) value
     * @returns {Number} the result of clamping the value
     */
    clampUnordered: (value, b1, b2) => Math.max(Math.min(value, Math.max(b1, b2)), Math.min(b1, b2)),

    /**
     * 
     * @param {Number} value the value to check
     * @param {Number} min the lowest value in the range
     * @param {Number} max the highest value in the range
     * @returns {boolean} min <= value <= max
     */
    inRange: (value, min, max) => value == Utility.clamp(value, min, max),

    /**
     * allows you to check if a value is 
     * @param {Number} value the value to check
     * @param {Number} b1 the highest or lowest value in the range
     * @param {Number} b2 the highest or lowest value in the range (opposite of b2)
     * @returns {boolean} value is equal to b1 or b2 or between b1 and b2
     */
    inRangeUnordered: (value, b1, b2) => value == Utility.clampUnordered(value, b1, b2),

    /**
     * if min > max, there is no overlap
     * @param {Number} min1 
     * @param {Number} max1 
     * @param {Number} min2 
     * @param {Number} max2 
     * @returns {Number[]} the minimum and maximum values of the range of numbers which are in both ranges given
     * @returns {Number[]} [min, max]
     */
    rangeOverlap: (min1, max1, min2, max2) => [Math.max(min1, min2), Math.min(max1, max2)],

    /**
     * if min > max, there is no overlap
     * the boundaries of each range can be given in any order (highest first or lowest first)
     * @param {Number} range1boundary1 
     * @param {Number} range1boundary2 
     * @param {Number} range2boundary1 
     * @param {Number} range2boundary2 
     * @returns {Number[]} the minimum and maximum values of the range of numbers which are in both ranges given
     * @returns {Number[]} [min, max]
     */
    rangeOverlapUnordered: (range1boundary1, range1boundary2, range2boundary1, range2boundary2) => {
        return Utility.rangeOverlap(
            Math.min(range1boundary1, range1boundary2), Math.max(range1boundary1, range1boundary2),
            Math.min(range2boundary1, range2boundary2), Math.max(range2boundary1, range2boundary2)
        )
    },

    isRangeOverlap: (min1, max1, min2, max2) => {
        let overlap = Utility.rangeOverlap(min1, max1, min2, max2);
        return overlap[0] < overlap[1];
    },

    isRangeOverlapUnordered: (range1boundary1, range1boundary2, range2boundary1, range2boundary2) => {
        let overlap = Utility.rangeOverlapUnordered(range1boundary1, range1boundary2, range2boundary1, range2boundary2);
        return overlap[0] < overlap[1];
    },

    /**
     * lerp is a funny word
     * @param {Number} a 
     * @param {Number} b 
     * @param {Number} t [0-1] inclusive
     * @returns the result of linearly interpolating between a and b, based on t
     */
    lerp: (a, b, t) => (b-a)*t + a,

    /**
     * returns `x` linearly mapped from the range `[min1-max1]` to the range `[min2-max2]`
     * +
     * @param {Number} x the number to map
     * @param {Number} min1 the lower bound of the input range
     * @param {Number} max1 the upper bound of the input range
     * @param {Number} min2 the lower bound of the target range
     * @param {Number} max2 the upper bound of the target range
     * @returns {Number}
     */
    map: (x, min1, max1, min2, max2) => (x-min1)/(max1-min1) * (max2-min2) + min2,

    /**
     * 
     * @param {Vector} position of the centre of the circle
     * @param {Number} r radius
     * @param {Number?} startAngle in rotations, not radians
     * @param {Number?} endAngle in rotations, not radians
     * @param {boolean?} shouldFill 
     * @param {boolean?} shouldStroke 
     */
    circle: (position, r, shouldFill=false, shouldStroke=false) => {
        Canvas.ctx.beginPath();
        Canvas.ctx.arc(position.x, position.y, r, 0, 2*PI);
        if (shouldFill) Canvas.ctx.fill();
        if (shouldStroke) Canvas.ctx.stroke();
    },

    randomPointOnRectangle: (x, y, width, height) => {
        let value = Math.random()*(2*width + 2*height);
        if (value < width) {
            return new Vector(x+value, y);
        }
        if (value < 2*width) {
            return new Vector(x+value - width, y+height);
        }
        value -= 2*width;
        if (value < height) {
            return new Vector(x, y+value);
        }
        return new Vector(x, y+value - width);
    },
};