(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const maths = require('../src/maths.js');
const ParticleSet = require('../src/particle.js').ParticleSet;

const backgroundColour = '#f2f3f4';

module.exports = function(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get each frequency's amplitude
    v.setFFTSize(512);
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

},{"../src/maths.js":3,"../src/particle.js":4}],2:[function(require,module,exports){
const Visualiser = require('./src/visualiser.js').Visualiser;
const renderFunction = require('./demos/frequency-bars.js');

// Create a Visualiser instance that visualises the audio using the canvas
const visualiser = new Visualiser('out', 'in', renderFunction);
},{"./demos/frequency-bars.js":1,"./src/visualiser.js":5}],3:[function(require,module,exports){
// Some useful functions for doing visualisations

function lerp(a, b, t) {
    return (b - a) * t + a;
}

function quad(a, b, t) {
    return (b - a) * Math.pow(t, 2) + a;
}

function cubic(a, b, t) {
    return (b - a) * Math.pow(t, 3) + a;
}

function polyInterpolate(a, b, t, i) {  
    return (b - a) * Math.pow(t, i) + a;
}

function clip(a, b, t) {
    if (a <= b) {
        if (a + t >= b) {
            return b;
        } else {
            return a + t;
        }
    } else {
        if (a + t <= b) {
            return b;
        } else {
            return a + t;
        }
    }
    
}

function mean(a) {
    return a.reduce((total, current) => total + current, 0) / a.length;
}

function max(a) {
    return a.reduce(function(total, current) {
        return Math.max(total, current);
    });
}

function euclideanDistance(a, b) {
    return Math.sqrt(a^2 + b^2);
}

function randomIntInRange(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function isInOpenRange(a, b, t) {
    return a < t && t < b //|| a > t && t > b;
}

function isInClosedRange(a, b, t) {
    return a <= t && t <= b || a >= t && t >= b;
}

module.exports = {
    max,
    mean,
    euclideanDistance,
    lerp,
    quad,
    cubic,
    polyInterpolate,
    clip,
    randomIntInRange,
    isInOpenRange,
    isInClosedRange
};
},{}],4:[function(require,module,exports){
const maths = require('./maths.js');

function Particle(x, y, vX, vY, minX, maxX, minY, maxY, xEdgeBehaviour, yEdgeBehaviour) {
    // Position
    this.x = x;
    this.y = y;

    // Velocity
    this.vX = vX;
    this.vY = vY;

    // Space
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    // Edge behaviour ('none' || 'bounce' || 'wrap')
    this.xEdgeBehaviour = xEdgeBehaviour;
    this.yEdgeBehaviour = yEdgeBehaviour;
}

Particle.prototype.move = function(factor) {
    this.x += this.vX * factor;
    this.y += this.vY * factor;
};

Particle.prototype.bounceX = function() {
    this.vX *= -1;
};

Particle.prototype.bounceY = function() {
    this.vY *= -1;
};

Particle.prototype.wrapX = function() {
    this.x = this.maxX - this.x;
};

Particle.prototype.wrapY = function() {
    this.y = this.maxY - this.y;
};

Particle.prototype.accelerate = function(acceleration) {
    this.vX *= acceleration;
    this.vY *= acceleration;
};

Particle.prototype.isInXSpace = function() {
    return maths.isInOpenRange(this.minX, this.maxX, this.x);
}

Particle.prototype.isInYSpace = function() {
    return maths.isInOpenRange(this.minY, this.maxY, this.y);
}

Particle.prototype.tick = function(factor) {
    // Move
    this.move(factor);

    // Handle edge behaviour (collision detection)
    if (!this.isInXSpace()) {
        console.log('outside');
        if (this.xEdgeBehaviour == 'bounce') {
            this.bounceX();
        } else if (this.xEdgeBehaviour == 'wrap') {
            this.wrapX();
        }
    }
    if (!this.isInYSpace()) {
        if (this.yEdgeBehaviour == 'bounce') {
            this.bounceY();
        } else if (this.yEdgeBehaviour == 'wrap') {
            this.wrapY();
        }
    }
}

function ParticleSet(size, options) {
    // Create particles array
    this.particles = spawnRandomParticles(size, options.minX, options.maxX, options.minY, options.maxY, options.maxV, options.xEdgeBehaviour, options.yEdgeBehaviour);
}

ParticleSet.prototype.tick = function(factor) {
    this.particles.forEach(function(particle) {
        particle.tick(factor);
    });
}

function spawnRandomParticle(minX, maxX, minY, maxY, maxV, xEdgeBehaviour, yEdgeBehaviour) {
    // Generate position
    const x = maths.randomIntInRange(minX, maxX);
    const y = maths.randomIntInRange(minY, maxY);

    // Generate velocity
    const vX = maths.randomIntInRange(-maxV, maxV);
    const vY = maths.randomIntInRange(-maxV, maxV);

    return new Particle(x, y, vX, vY, minX, maxX, minY, maxY, xEdgeBehaviour, yEdgeBehaviour);
}

function spawnRandomParticles(quantity, minX, maxX, minY, maxY, maxV, xEdgeBehaviour, yEdgeBehaviour) {
    let particles = [];

    for (let i = 0; i < quantity; i++) {
        particles.push(spawnRandomParticle(minX, maxX, minY, maxY, maxV, xEdgeBehaviour, yEdgeBehaviour));
    }

    return particles;
}

module.exports = {
    ParticleSet: ParticleSet
};
},{"./maths.js":3}],5:[function(require,module,exports){
const maths = require('./maths.js');

function Visualiser(canvasID, audioID, renderFunction) {
    this.initialiseCanvas(canvasID);
    this.initialiseAudio(audioID);
    this.initialiseNodes();

    // Private properties
    this._previousAmplitude = 0;

    // Get references to visualiser instance and render function
    const v = this;
    const render = renderFunction;

    // Request animation frame using custom render function
    window.requestAnimationFrame(function renderFrame() {
        render(v);
        window.requestAnimationFrame(renderFrame);
    });
}

Visualiser.prototype.initialiseCanvas = function(id) {
    // Create canvas rendering context
    this.canvas = document.querySelector(`#${id}`);
    this.renderingContext = this.canvas.getContext('2d');

    // Make canvas fill screen
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    
    // Fix resolution
    const pixelRatio = window.devicePixelRatio;
    this.canvas.width *= pixelRatio;
    this.canvas.height *= pixelRatio;
    this.canvas.style.width = this.canvas.width/pixelRatio + "px";
    this.canvas.style.height = this.canvas.height/pixelRatio + "px";
    //this.renderingContext.scale(pixelRatio, pixelRatio);
};

Visualiser.prototype.initialiseAudio = function(id) {
    // Create audio context and load audio
    const Context = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new Context;
    this.audioElement = document.querySelector(`#${id}`);
};

Visualiser.prototype.initialiseNodes = function() {
    // Create nodes
    const source = this.audioContext.createMediaElementSource(this.audioElement);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048; // (default fft size)
    const destination = this.audioContext.destination;

    // Connect nodes
    source.connect(this.analyser);
    this.analyser.connect(destination);
};

Visualiser.prototype.setFFTSize = function(size) {
    this.analyser.fftSize = size;
};

Visualiser.prototype.getAmplitude = function() {
    // Get time domain data
    var data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);

    // Calculate peak
    const peak = maths.max(data);

    // Scale amplitude to between 0 and 1
    const amplitude = (peak - 128) / 128;
    return amplitude;
};

Visualiser.prototype.getAmplitudeSmooth = function(factor = 0.15) {
    const amp = this.getAmplitude();
    const smoothAmp = this._smoothAmplitude(amp, factor);
    return smoothAmp;
};

Visualiser.prototype.getAmplitudeWeighted = function(weights) {
    // Get amplitude of each frequency
    const amps = this.getFrequenciesSmooth();

    // Scale each frequency by the corresponding weight
    const scaledAmps = amps.reduce((total, current, index) => total + current * weights[index], 1);

    // Calculate peak
    const peak = maths.max(scaledAmps);
    return peak;
};

Visualiser.prototype.amplitudeIsAbove = function(value) {
    return this.getAmplitudeSmooth() > value;
};

/**
 * TODO: Fix this method so that the two amplitudes being compared for the interpolation are of the same frequency band.
 * At the moment, the method is compared the last-checked amplitude which is almost always the frequency band below the current one.
 * This results in weird interaction between the bands which is kind of cool, but not what we want.
 * Actually, adding a separate method to do smoothing for frequency domain data would be good.
 */ 
Visualiser.prototype._smoothAmplitude = function(amp, factor = 0.15) {
    const smoothAmp = maths.lerp(this._previousAmplitude, amp, factor);
    this._previousAmplitude = smoothAmp;
    return smoothAmp;
};

Visualiser.prototype.getFrequencies = function() {
    let data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    // Scale each amplitude to between 0 and 1
    return Array.prototype.map.call(data, (amp) => amp / 255);
};

Visualiser.prototype.getFrequenciesSmooth = function(factor = 0.15) {
    const data = this.getFrequencies();
    return data.map(x => this._smoothAmplitude(x, factor));
};

Visualiser.prototype.numberOfFrequencyBands = function() {
    return this.analyser.frequencyBinCount;
};

module.exports = {
    Visualiser
};
},{"./maths.js":3}]},{},[2]);
