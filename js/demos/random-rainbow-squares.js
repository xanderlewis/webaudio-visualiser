const maths = require('../src/maths.js');

let squareCentres = [];

function randomRainbowSquares(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Calculate actual size of squares (between 0 and something pixels)
    const actualSize = maths.quad(0, 400, amp);

    // Calculate positions of squares if not already done
    if (squareCentres.length == 0) {
        for (var i = 0; i < 256; i++) {
            squareCentres.push([Math.floor(Math.random()*canvasWidth), Math.floor(Math.random()*canvasHeight)]);
        }
    }

    // Clear canvas
    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    // Draw squares
    squareCentres.forEach(function(point) {
        const originX = point[0] - actualSize/2;
        const originY = point[1] - actualSize/2;
        ctx.fillStyle = `hsl(${maths.lerp(0, 360, amp)},100%,50%)`;
        ctx.fillRect(originX, originY, actualSize, actualSize);
    });
}

module.exports = randomRainbowSquares;