(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../src/visualiser.js":3}],2:[function(require,module,exports){
const Visualiser = require('./src/visualiser.js').Visualiser;
const renderFunction = require('./demos/roving-circles.js');

// Create a Visualiser instance that visualises the audio using the canvas
const visualiser = new Visualiser('out', 'in', renderFunction);
},{"./demos/roving-circles.js":1,"./src/visualiser.js":3}],3:[function(require,module,exports){
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

function randomIntInRange(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function isInOpenRange(a, b, t) {
    return a < t && t < b //|| a > t && t > b;
}

function isInClosedRange(a, b, t) {
    return a <= t && t <= b || a >= t && t >= b;
}

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
    this.analyser.fftSize = 2048;
    const destination = this.audioContext.destination;

    // Connect nodes
    source.connect(this.analyser);
    this.analyser.connect(destination);
};

Visualiser.prototype.getAmplitude = function() {
    // Get time domain data
    var data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);

    // Calculate peak
    const peak = max(data);

    // Scale amplitude to between 0 and 1
    const amplitude = (peak - 128) / 128;
    return amplitude;
};

Visualiser.prototype.getAmplitudeSmooth = function(factor) {
    const amp = this.getAmplitude();
    const smoothAmp = lerp(this._previousAmplitude, amp, factor);
    this._previousAmplitude = smoothAmp;

    return smoothAmp;
};

Visualiser.prototype.amplitudeIsAbove = function(value) {
    return this.getAmplitudeSmooth() > value;
};

module.exports = {
    Visualiser: Visualiser,
    helpers: {
        lerp: lerp,
        quad: quad,
        cubic: cubic,
        polyInterpolate: polyInterpolate,
        clip: clip,
        randomIntInRange, randomIntInRange,
        isInOpenRange, isInOpenRange,
        isInClosedRange, isInClosedRange
    }
};
},{}]},{},[2]);
