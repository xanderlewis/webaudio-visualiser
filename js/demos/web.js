const maths = require('../src/maths.js');
const ParticleSet = require('../src/particle.js').ParticleSet;

let particleSet;

module.exports = function(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Set up particle set
    if (particleSet == undefined) {
        // Set up particle set
        particleSet = new ParticleSet(120, {
            minX: 0,
            maxX: canvasWidth,
            minY: 0,
            maxY: canvasHeight,
            maxV: 4,
            xEdgeBehaviour: 'bounce',
            yEdgeBehaviour: 'bounce'
        });
    }

    // Draw background
    const hWidth = canvasWidth / 2;
    const hHeight = canvasHeight / 2;
    const innerColour = '#8b9d9e' //'#ff145c';
    const outerColour = '#6e7f80' //'#9e0030';
    var gradient = ctx.createRadialGradient(hWidth, hHeight, 0, hWidth, hHeight, hWidth);
    gradient.addColorStop(0, innerColour);
    gradient.addColorStop(1, outerColour);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw flash
    ctx.fillStyle = `rgba(255,0,127,${maths.polyInterpolate(0, 1, amp, 3)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw web
    const p = particleSet.particles;
    
    for (var i = 1; i < p.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(p[i].x, p[i].y);
        ctx.lineTo(p[i+1].x, p[i+1].y);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = maths.euclideanDistance(p[i].vX, p[i].vY) / 4;
        ctx.stroke();
    }
    

    // Update particle set
    particleSet.tick(maths.polyInterpolate(0, 20, amp, 3));
}