const maths = require('../src/maths.js');
const ParticleSet = require('../src/particle.js').ParticleSet;

const backgroundColour = '#f2f3f4';

module.exports = function(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get each frequency's amplitude
    const amps = v.getFrequencies(0.15);

    // Draw background
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate bars
    const graphOriginX = 0;
    const graphOriginY = 0;
    const graphWidth = canvasWidth;
    const graphHeight = canvasHeight;
    const numberOfBars = v.numberOfFrequencyBands();
    const barWidth = graphWidth / numberOfBars;

    // Draw bars
    
    for (var i = 0; i < numberOfBars; i++) {
        // Calculate bar height
        const barHeight = maths.lerp(0, graphHeight, amps[i]);

        ctx.fillStyle = `hsla(${maths.lerp(0, 360, amps[i])}, 100%, 50%, 1)`;

        // Draw single bar
        ctx.fillRect(graphOriginX + barWidth * i, graphOriginY + (graphHeight - barHeight), barWidth, barHeight);
    }
}
