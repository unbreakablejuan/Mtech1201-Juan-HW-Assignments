let emitter;

function setup() {
  createCanvas(windowWidth, windowHeight);
  emitter = new Emitter(width / 2, height);
}

function draw() {
  background(255,50);
  let GRAVITY = createVector(0, 200);
  emitter.applyForce(GRAVITY);
  emitter.addParticle();
  emitter.run();
}

// =========================
//   PARTICLE CLASS
// =========================
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(-random(0, 10), -random(0, 10));
    this.acc = createVector(5,5);
    this.lifespan = 500;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  run() {
    this.update();
    this.show();
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 2;
  }

  show() {
    noStroke();
    fill(0, this.lifespan);
    circle(this.pos.x, this.pos.y, 10);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

// =========================
//   EMITTER CLASS
// =========================
class Emitter {
  constructor(x, y) {
    this.origin = createVector(x, y);
    this.particles = [];
  }

  addParticle() {
    this.particles.push(new Particle(this.origin.x, this.origin.y));
  }

  applyForce(force) {
    for (let p of this.particles) {
      p.applyForce(force/1.2);
    }
  }

  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.run();
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}