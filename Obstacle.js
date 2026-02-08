class Obstacle extends Vehicle {
  constructor(x, y, size = 50) {
    super(x, y);
    this.size = size; // visual diameter
    this.r = this.size / 2; // radius used elsewhere
    this.angle = 0;
    this.spin = random(-0.05, 0.05);
    this.type = "SPIKE";
    // give it a small random velocity so it moves
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    // Spike ball visual (kept from sketch drawObstacles)
    stroke(150, 50, 50);
    fill(50, 0, 0);
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.5) {
      let r = (this.size / 2);
      if (a % 1.0 > 0.4) r += 10; // Spikes
      let sx = r * cos(a);
      let sy = r * sin(a);
      vertex(sx, sy);
    }
    endShape(CLOSE);

    // Inner Core
    fill(255, 100, 100);
    noStroke();
    circle(0, 0, this.size / 3);

    pop();
  }
}