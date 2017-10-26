const Visualiser = require('./src/visualiser.js').Visualiser;
const renderFunction = require('./demos/web.js');

// Create a Visualiser instance that visualises the audio using the canvas
const visualiser = new Visualiser('out', 'in', renderFunction);