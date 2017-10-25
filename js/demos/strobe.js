const maths = require('../src/maths.js');

let strobeInterval = 500; // one change every 100 frames
let frameCounter = 0;

let lightIsOn = false;

function strobe(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Adjust strobe interval according to amplitude
    strobeInterval = maths.polyInterpolate(500, 1, amp, 0.01);

    // Fill canvas
    if (frameCounter >= strobeInterval) {
        if (!lightIsOn) {
            ctx.fillStyle = 'white';
            lightIsOn = true;
        } else {
            ctx.fillStyle = 'black';
            lightIsOn = false;
        }
        frameCounter = 0;
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    console.log(frameCounter);

    // Advance frame counter
    frameCounter += 1;
}

module.exports = strobe;