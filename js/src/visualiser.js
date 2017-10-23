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