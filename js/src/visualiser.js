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
    this.analyser.fftSize = 512; //2048;
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