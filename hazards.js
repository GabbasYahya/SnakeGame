class Bomb {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.timer = 120; // 2 seconds warning (60fps)
    this.radius = 120; // Warning Zone Diameter
    this.exploded = false;
    this.explosionDuration = 15;
    this.isDead = false;
  }

  update() {
    if (this.timer > 0) {
      this.timer--;
      if (this.timer <= 0) {
        this.exploded = true;
        // visual effect
        spawnExplosion(this.pos.x, this.pos.y, color(255, 100, 0));
        spawnExplosion(this.pos.x + 10, this.pos.y + 10, color(255, 0, 0));
        spawnExplosion(this.pos.x - 10, this.pos.y - 10, color(255, 255, 0));
      }
    } else if (this.exploded) {
      this.explosionDuration--;
      if (this.explosionDuration <= 0) {
        this.isDead = true;
      }
    }
  }

  show() {
    if (this.timer > 0) {
      // Warning phase
      noStroke();
      // Blinking red alert
      let alpha = map(sin(frameCount * 0.5), -1, 1, 50, 150);
      fill(255, 0, 0, alpha); 
      circle(this.pos.x, this.pos.y, this.radius);
      
      // Countdown Ring
      noFill();
      stroke(255);
      strokeWeight(4);
      let angle = map(this.timer, 120, 0, 0, TWO_PI);
      arc(this.pos.x, this.pos.y, this.radius, this.radius, -HALF_PI, -HALF_PI + angle);
      
      // Reticle
      stroke(255, 0, 0);
      strokeWeight(1);
      line(this.pos.x - 10, this.pos.y, this.pos.x + 10, this.pos.y);
      line(this.pos.x, this.pos.y - 10, this.pos.x, this.pos.y + 10);
      
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      text("DANGER!", this.pos.x, this.pos.y - this.radius/2 - 10);
      
    } else if (this.exploded) {
      // Damage zone visual
      fill(255, 50, 0, 150);
      noStroke();
      circle(this.pos.x, this.pos.y, this.radius + 30);
    }
  }

  checkCollision(targetPos, targetRadius) {
    if (this.exploded && this.explosionDuration > 0) { // Active damage frames
      let d = dist(this.pos.x, this.pos.y, targetPos.x, targetPos.y);
      // Hit if within blast radius
      if (d < (this.radius/2) + targetRadius + 10) { 
         return true;
      }
    }
    return false;
  }
}

class EnemySnake extends Vehicle {
  constructor(x, y, vx, vy) {
    super(x, y);
    this.vel = createVector(vx, vy);
    this.segments = [];
    this.length = 8;
    this.r = 20;

    // Init segments behind the head
    let dir = this.vel.copy().normalize().mult(-1);
    for (let i = 0; i < this.length; i++) {
      let offset = dir.copy().mult(i * 25);
      this.segments.push(createVector(this.pos.x + offset.x, this.pos.y + offset.y));
    }
  }

  update() {
    // Move head
    this.pos.add(this.vel);
    
    let isHorizontal = Math.abs(this.vel.x) > Math.abs(this.vel.y);

    // Simple sinusoidal movement for the "Snake" feeling
    for (let i = 0; i < this.length; i++) {
      let seg = this.segments[i];
      seg.add(this.vel);
      let wave = sin(frameCount * 0.2 + i * 0.5) * 5;
      
      if(isHorizontal) {
          seg.y = this.pos.y + wave;
      } else {
          seg.x = this.pos.x + wave;
      }
    }
  }

  show() {
    // Segments
    stroke(0);
    strokeWeight(2);
    for (let i = 0; i < this.length; i++) {
      fill(150 + i * 10, 0, 50 + i * 20);
      circle(this.segments[i].x, this.segments[i].y, this.r * 2);
    }

    // Head (with slight bob)
    fill(100, 0, 0);
    circle(this.pos.x, this.pos.y + sin(frameCount * 0.2) * 5, this.r * 2.5);

    // Eyes
    fill(255, 255, 0);
    ellipse(this.pos.x, this.pos.y - 8, 8, 8);
    ellipse(this.pos.x, this.pos.y + 8, 8, 8);

    // Debug visuals when enabled
    if (Vehicle.debug) {
      // Velocity vector
      push();
      stroke(0, 255, 255);
      strokeWeight(2);
      line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
      pop();

      // Small markers on segments
      for (let i = 0; i < this.length; i++) {
        push();
        noFill();
        stroke(0, 255, 255, 150);
        circle(this.segments[i].x, this.segments[i].y, 8);
        pop();
      }

      // Label
      push();
      noStroke();
      fill(0, 255, 255);
      textAlign(CENTER);
      textSize(12);
      text("EnemySnake", this.pos.x, this.pos.y - 20);
      pop();
    }
  }

  checkCollision(targetPos, targetRadius) {
    // Head
    if (dist(this.pos.x, this.pos.y, targetPos.x, targetPos.y) < this.r + 10 + targetRadius) return true;

    // Body
    for (let seg of this.segments) {
      if (dist(seg.x, seg.y, targetPos.x, targetPos.y) < this.r + targetRadius) return true;
    }
    return false;
  }

  isOffScreen() {
    if (this.vel.x > 0) return this.segments[this.length - 1].x > width + 50;
    else return this.segments[this.length - 1].x < -50;
  }
}
