const maths = require('./maths.js');

function Visualiser(canvasID, audioID, renderFunction) {
    this.initialiseCanvas(canvasID);
    this.initialiseAudio(audioID);
    this.initialiseNodes();

    // Private properties
    this._previousAmplitude = 0.5;

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

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'allpass';
    this.filter.gain.value = 0;

    const destination = this.audioContext.destination;

    // Connect nodes
    source.connect(this.analyser);
    this.analyser.connect(this.filter);
    this.filter.connect(destination);
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

/**
 * TODO: Fix the weightFrequencies* stuff so that the sound the user hears is not affected by the filter.
 * Only the analyser's input should be filtered.
 * 
 */ 
Visualiser.prototype.weightFrequenciesBelow = function(frequency, weight) {
    this.filter.type = 'lowshelf';
    this.filter.frequency.value = frequency;
    this.filter.gain.value = weight;
};

Visualiser.prototype.weightFrequenciesAbove = function(frequency, weight) {
    this.filter.type = 'highshelf';
    this.filter.frequency.value = frequency;
    this.filter.gain.value = weight;
};

Visualiser.prototype.resetFrequencyWeight = function() {
    this.filter.gain.value = 0;
};

module.exports = {
    Visualiser
};