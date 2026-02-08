class Particle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 6)); // Random speed
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.col = col || color(255);
    this.size = random(4, 8);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.lifespan -= 5; // Fade out
  }

  show() {
    noStroke();
    // Use the color passed but with current lifespan for alpha
    // We assume col is a p5 Color object or array
    
    // Quick way to handle alpha with p5 color
    let c = color(this.col);
    c.setAlpha(this.lifespan);
    fill(c);
    
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  finished() {
    return this.lifespan < 0;
  }
}
