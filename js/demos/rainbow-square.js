const lerp = require('../src/maths.js').lerp;

module.exports = function(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Calculate actual size of square (between 0 and 1000 pixels)
    const actualSize = lerp(0, canvasHeight, amp);
    
    // Calculate position of origin of square
    const centreX = canvasWidth/2;
    const centreY = canvasHeight/2;

    const originX = centreX - actualSize/2;
    const originY = centreY - actualSize/2;

    // Clear canvas
    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    // Set fill style
    ctx.fillStyle = `hsl(${lerp(0, 360, amp)},100%,50%)`;

    ctx.fillRect(originX, originY, actualSize, actualSize);
};