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