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
    max: max,
    mean: mean,
    euclideanDistance: euclideanDistance,
    lerp: lerp,
    quad: quad,
    cubic: cubic,
    polyInterpolate: polyInterpolate,
    clip: clip,
    randomIntInRange, randomIntInRange,
    isInOpenRange, isInOpenRange,
    isInClosedRange, isInClosedRange
};