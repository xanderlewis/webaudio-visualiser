const helpers = require('../src/visualiser.js').helpers;

function Circle(x, y, vX, vY, r) {
    this.x = x;
    this.y = y;
    this.vX = vX;
    this.vY = vY;

    this.r = r;

    this.move = function(amount) {
        this.x += this.vX * amount;
        this.y += this.vY * amount;
    };

    this.bounceX = function() {
        this.vX *= -1;
    };

    this.bounceY = function() {
        this.vY *= -1;
    };

    this.boost = function(boost) {
        this.vX *= boost;
        this.vY *= boost;
    };
}

let circles = [];

function rovingCircles(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Initialise circles if not already done
    if (circles.length == 0) {
        for (var i = 0; i < 400; i++) {
            // Generate origin of circle
            const x = helpers.randomIntInRange(0, canvasWidth);
            const y = helpers.randomIntInRange(0, canvasHeight);

            // Generate velocity of circle
            const maxV = 10;
            const vX = helpers.randomIntInRange(-maxV, maxV);
            const vY = helpers.randomIntInRange(-maxV, maxV);

            circles.push(new Circle(x, y, vX, vY, 4));
        }
    }

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const hWidth = canvasWidth / 2;
    const hHeight = canvasHeight / 2;

    // Draw gradient
    const innerColour = '#ff145c';
    const outerColour = '#9e0030';
    var gradient = ctx.createRadialGradient(hWidth, hHeight, 0, hWidth, hHeight, hWidth);
    gradient.addColorStop(0, innerColour);
    gradient.addColorStop(1, outerColour);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw flash
    ctx.fillStyle = `rgba(255,255,0,${helpers.cubic(0, 1, amp)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw circles
    circles.forEach(function(circle) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    });

    // Update circle positions
    circles.forEach(function(circle) {
        circle.move(helpers.polyInterpolate(0, 6, amp, 4));

        // Check if hit edge
        if (!helpers.isInOpenRange(0, canvasWidth, circle.x)) {
            circle.bounceX();
        }
        if (!helpers.isInOpenRange(0, canvasHeight, circle.y)) {
            circle.bounceY();
        }
    })
}

module.exports = rovingCircles;