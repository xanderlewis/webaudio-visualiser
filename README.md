# webaudio-visualiser

A JavaScript library/framework for creating audio visualisers. [currently in very, very early development]

**webaudio-visualiser** defines one object: `Visualiser`.

A `Visualiser` links an HTML `<audio>` element to an HTML `<canvas>` element, and uses a `renderingFunction` to draw visuals.

The `Visualiser` exposes some useful functions for accessing current audio data.

### getAmplitude()
Returns the current amplitude of the audio. This 'amplitude' is a peak signal value across a number of audio samples.

### getAmplitudeSmooth(factor)
Returns the current amplitude, with linear interpolation between the returned value and the last returned value. `factor` controls how much the amplitude is allowed to change between measurements.

## Usage

Have your `<audio>` and `<canvas>` ready.

    <html>
        <body>
            <audio id="in" src="/sound/dilla.mp3" type="audio/mp3"></audio>
            <canvas id="out"></canvas>
            <script src="/bundle.js"></script>
        </body>
    </html>

Require the module.

    const Visualiser = require('./src/visualiser.js').Visualiser;

Create a *render function*. This is where you put your drawing code. The render function takes one parameter: a reference to the visualiser instance that called it.

    function render(v) {
        // Do some drawing...
    }

Create a `Visualiser` instance, specifying the `id` of the canvas and audio elements, as well as our *render function*.

    const visualiser = new Visualiser('out', 'in', render);
...and you're all set.

From within your *render function*, you can access the canvas' RenderingContext2D from `v.ctx`.