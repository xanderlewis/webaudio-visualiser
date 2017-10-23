(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const lerp = require('../src/visualiser.js').helpers.lerp;

let squareCentres = [];

function randomRainbowSquares(v) {
    const ctx = v.renderingContext;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get amplitude
    const amp = v.getAmplitudeSmooth(0.15);

    // Calculate actual size of squares (between 0 and something pixels)
    const actualSize = lerp(0, 400, amp);

    // Calculate positions of squares if not already done
    if (squareCentres.length == 0) {
        for (var i = 0; i < 32; i++) {
            squareCentres.push([Math.floor(Math.random()*canvasWidth), Math.floor(Math.random()*canvasHeight)]);
        }
    }

    // Clear canvas
    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    // Draw squares
    squareCentres.forEach(function(point) {
        const originX = point[0] - actualSize/2;
        const originY = point[1] - actualSize/2;
        ctx.fillStyle = `hsl(${lerp(0, 360, amp)},100%,50%)`;
        ctx.fillRect(originX, originY, actualSize, actualSize);
    });
}

module.exports = randomRainbowSquares;
},{"../src/visualiser.js":3}],2:[function(require,module,exports){
const Visualiser = require('./src/visualiser.js').Visualiser;
const renderFunction = require('./demos/randomRainbowSquares.js');

// Create a Visualiser instance that visualises the audio using the canvas
const visualiser = new Visualiser('out', 'in', renderFunction);
},{"./demos/randomRainbowSquares.js":1,"./src/visualiser.js":3}],3:[function(require,module,exports){
function lerp(a, b, t) {
    return (b - a) * t + a;
}

function mean(a) {
    return a.reduce((total, current) => total + current, 0) / a.length;
}

function max(a) {
    return a.reduce(function(total, current) {
        return Math.max(total, current);
    });
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

module.exports = {
    Visualiser: Visualiser,
    helpers: {
        lerp: lerp
    }
};
},{}]},{},[2]);
