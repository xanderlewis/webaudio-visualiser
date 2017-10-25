const maths = require('../src/maths.js');
const ParticleSet = require('../src/particle.js').ParticleSet;

let particleSet;

module.exports = function(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Set up particle set
    if (particleSet == undefined) {
        // Set up particle set
        particleSet = new ParticleSet(400, {
            minX: 0,
            maxX: canvasWidth,
            minY: 0,
            maxY: canvasHeight,
            maxV: 10,
            xEdgeBehaviour: 'bounce',
            yEdgeBehaviour: 'bounce'
        });
    }

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const hWidth = canvasWidth / 2;
    const hHeight = canvasHeight / 2;

    // Draw gradient
    const innerColour = '#6e7f80' //'#ff145c';
    const outerColour = '#4b5657' //'#9e0030';
    var gradient = ctx.createRadialGradient(hWidth, hHeight, 0, hWidth, hHeight, hWidth);
    gradient.addColorStop(0, innerColour);
    gradient.addColorStop(1, outerColour);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw flash
    ctx.fillStyle = `rgba(255,150,0,${maths.polyInterpolate(0, 1, amp, 2)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw particles
    particleSet.particles.forEach(function(particle) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    });

    // Update particle set
    particleSet.tick(maths.polyInterpolate(0, 6, amp, 3));
}