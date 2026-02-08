class Vehicle {
  static debug = false;
  static debugObstacleColor = '#00FFFF';

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 10;
    this.maxForce = 0.6;
    this.r = 16;
    this.rayonZoneDeFreinage = 100;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target, d=0) {
    // 2nd argument true enables the arrival behavior
    // 3rd argument d is the distance behind the target
    // for "snake" behavior
    return this.seek(target, true, d);
  }

  flee(target) {
    // recopier code de flee de l'exemple précédent
  }

  seek(target, arrival = false, d=0) {
    let valueDesiredSpeed = this.maxSpeed;

    if (arrival) {
      // On définit un rayon de 100 pixels autour de la cible
      // si la distance entre le véhicule courant et la cible
      // est inférieure à ce rayon, on ralentit le véhicule
      // desiredSpeed devient inversement proportionnelle à la distance
      // si la distance est petite, force = grande
      // Vous pourrez utiliser la fonction P5 
      // distance = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
      // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
      // entre nouvelleValeurMin et nouvelleValeurMax

      // 1 - dessiner le cercle de rayon 100 autour de la target
      if (Vehicle.debug) {
        push();
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, this.rayonZoneDeFreinage);
        pop();
      }

      // 2 - calcul de la distance entre la cible et le véhicule
      let distance = p5.Vector.dist(this.pos, target);

      // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
      // qui devient inversement proportionnelle à la distance.
      // si d = rayon alors desiredSpeed = maxSpeed
      // si d = 0 alors desiredSpeed = 0
      if (distance < this.rayonZoneDeFreinage) {
        valueDesiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    // Ici on calcule la force à appliquer au véhicule
    // pour aller vers la cible (avec ou sans arrivée)
    // un vecteur qui va vers la cible, c'est pour le moment la vitesse désirée
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    desiredSpeed.setMag(valueDesiredSpeed);
   
    // Force = desiredSpeed - currentSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    
    stroke(255);
    strokeWeight(2);
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    if(this.vel.mag() > 0)
      rotate(this.vel.heading());

    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
    /*
   push();
   // on dessine le vehicule comme un cercle
   fill("blue");
   stroke("white");
   strokeWeight(2);
   translate(this.pos.x, this.pos.y);
   circle(0, 0, this.r * 2);  
   pop();
   */
  }

  // Centralisé: dessine des aides de debug si des informations sont passées
  debugDraw(data = {}) {
    if (!Vehicle.debug) return;

    // Dessine l'obstacle le plus proche
    if (data.obstacleLePlusProche) {
      push();
      fill(Vehicle.debugObstacleColor || "red");
      noStroke();
      circle(data.obstacleLePlusProche.pos.x, data.obstacleLePlusProche.pos.y, data.obstacleLePlusProche.r * 2);
      pop();
    }

    // Ligne 'ahead' vers le point au bout de ahead
    if (data.pointAuBoutDeAhead) {
      push();
      stroke("yellow");
      strokeWeight(2);
      line(this.pos.x, this.pos.y, data.pointAuBoutDeAhead.x, data.pointAuBoutDeAhead.y);
      pop();
    }

    // Debug Wander: cercle de la zone et ligne vers le point de wander
    if (data.wanderPoint) {
      push();
      stroke(255, 50);
      noFill();
      let radius = data.wanderRadius || this.wanderRadius || 0;
      circle(data.wanderPoint.x, data.wanderPoint.y, radius * 2);
      line(this.pos.x, this.pos.y, data.wanderPoint.x, data.wanderPoint.y);
      fill("green");
      if (data.wanderTarget) circle(data.wanderTarget.x, data.wanderTarget.y, 8);
      pop();
    }

    // Cercle autour du véhicule (rayon)
    if (data.showSelfCircle) {
      push();
      noFill();
      stroke(255, 100);
      circle(this.pos.x, this.pos.y, this.r * 2);
      pop();
    }
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}

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
