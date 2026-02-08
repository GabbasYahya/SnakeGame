class Boss extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 3;
    this.maxForce = 0.2;
    this.r = 40; // Big radius
    this.health = 3;
    this.maxHealth = 3;
    this.attackTimer = 0;
    
    // Visuals
    this.color = color(255, 0, 0);
    this.pulse = 0;
  }

  update(target) {
    // 1. Movement: Relentless Chase
    let seekForce = this.seek(target);
    this.applyForce(seekForce);
    
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    
    // 2. Attack Logic: Shoot Bombs
    this.attackTimer++;
    if (this.attackTimer > 180) { // Every 3 seconds
        // Shoot a bomb towards the player (slightly inaccurate for fairness)
        let bombPos = target.copy().add(p5.Vector.random2D().mult(50));
        bombs.push(new Bomb(bombPos.x, bombPos.y));
        this.attackTimer = 0;
        
        // Visual flare
        this.pulse = 20;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // Body Body
    fill(50);
    stroke(255, 0, 0);
    strokeWeight(3);
    
    // Boss Color and Shape Shift based on Level
    // We can infer level from a global variable if available or pass it in. 
    // Assuming 'level' global is available from sketch.js
    
    // Draw based on Level Phase
    let phase = (typeof level !== 'undefined') ? level % 4 : 0;

    if (phase === 0) {
        // SQUARE MECH
        beginShape();
        vertex(this.r, 0);
        vertex(-this.r, -this.r/2);
        vertex(-this.r + 10, 0);
        vertex(-this.r, this.r/2);
        endShape(CLOSE);
    } else if (phase === 1) {
        // SPIKEY STAR
        let angleStep = TWO_PI / 8;
        beginShape();
        for(let a=0; a<TWO_PI; a+=angleStep){
            let r1 = this.r;
            let r2 = this.r * 0.4;
            let x1 = cos(a) * r1;
            let y1 = sin(a) * r1;
            vertex(x1, y1);
            let x2 = cos(a+angleStep/2) * r2;
            let y2 = sin(a+angleStep/2) * r2;
            vertex(x2, y2);
        }
        endShape(CLOSE);
    } else if (phase === 2) {
        // TWIN BLADES
        ellipse(0, -20, this.r*2, 20);
        ellipse(0, 20, this.r*2, 20);
        rect(-20, -20, 40, 40);
    } else {
        // CIRCLE SAW
        ellipse(0, 0, this.r*2.5, this.r*2.5);
    }

    // Glowing Core (Health Indicator)
    let healthColor = map(this.health, 0, this.maxHealth, 0, 255);
    fill(healthColor, 0, 0);
    noStroke();
    circle(0, 0, this.r);
    
    // Attack charging visual
    if (this.pulse > 0) {
        stroke(255, 255, 0, this.pulse * 10);
        noFill();
        circle(0, 0, this.r + 20 - this.pulse);
        this.pulse--;
    }

    // Health Bar above head
    rotate(-this.vel.heading()); // Keep bar horizontal
    noStroke();
    fill(100);
    rect(-30, -50, 60, 10);
    fill(0, 255, 0);
    let hpWidth = map(this.health, 0, this.maxHealth, 0, 60);
    rect(-30, -50, hpWidth, 10);

    pop();
  }

  checkSpikeCollision(obstacles) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      let d = dist(this.pos.x, this.pos.y, obs.pos.x, obs.pos.y);
      
      // Hit a spike!
      if (d < this.r + obs.size/2) {
        // Boom
        spawnExplosion(obs.pos.x, obs.pos.y, color(255, 100, 0));
        obstacles.splice(i, 1); // Remove spike
        this.takeDamage();
        
        // Knockback
        let recoil = p5.Vector.sub(this.pos, obs.pos);
        recoil.setMag(10);
        this.pos.add(recoil);
        return true;
      }
    }
    return false;
  }

  takeDamage() {
    this.health--;
    bgPulse = 50; // Screen shake effect
  }

  isDead() {
    return this.health <= 0;
  }
}
