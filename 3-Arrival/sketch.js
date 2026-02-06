let nbVehicules = 10;
let vehicles = [];
let apple;
let appleVel; // Moving apple velocity
let score = 0;
let highScore = 0;
let level = 1;
let gameState = "MENU"; // MENU, PLAY_SNAKE, PLAY_APPLE, GAME_OVER
let font;

// Obstacles & Powerups
let obstacles = []; // Array of Objects {pos, vel, angle, type}
let powerups = [];  // Array of Objects {pos, type}
let particles = []; // Explosion particles
let bombs = [];
let enemySnakes = [];

let snakeFrozen = false;
let freezeTimer = 0;

// Powerup States
let shieldActive = false;
let shieldTimer = 0;

// Preload resources
function preload() {
  font = loadFont('./assets/inconsolata.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Initialize standard snake size
  resetSnake(10);
  spawnApple();
}

function resetGame(mode) {
  score = 0;
  level = 1;
  shieldActive = false;
  
  // Dynamic Obstacles
  obstacles = [];
  spawnObstacles(5); // Start with fewer for Level 1
  
  powerups = [];
  bombs = [];
  enemySnakes = [];
  particles = [];
  
  snakeFrozen = false;
  freezeTimer = 0;

  if (mode === "SNAKE") {
    gameState = "PLAY_SNAKE";
    resetSnake(5); // Start small
  } else {
    gameState = "PLAY_APPLE";
    // Snake starts big in survival mode
    resetSnake(15);
  }
  // Spawn apple away from obstacles
  spawnApple();
}

function spawnObstacles(count) {
  for(let i=0; i<count; i++){
    let pos = createVector(random(50, width-50), random(50, height-50));
    let vel = p5.Vector.random2D().mult(random(0.5, 2)); // Dynamic movement
    obstacles.push({
      pos: pos,
      vel: vel,
      angle: random(TWO_PI),
      spin: random(-0.05, 0.05),
      size: random(40, 70),
      type: "SPIKE"
    });
  }
}


function resetSnake(size) {
  vehicles = [];
  let startX = width / 2;
  let startY = height / 2;
  
  for (let i = 0; i < size; i++) {
    vehicles.push(new Snake(startX, startY + i * 20, i));
  }
}

// Ensure elements don't spawn on obstacles
function getValidSpawnPosition() {
  let pos;
  let valid = false;
  while(!valid) {
    pos = createVector(random(50, width-50), random(50, height-50));
    valid = true;
    for(let obs of obstacles) {
      if(pos.dist(obs.pos) < obs.size + 20) valid = false;
    }
  }
  return pos;
}

function spawnApple() {
  apple = getValidSpawnPosition();
  appleVel = createVector(0,0);
}

function spawnExplosion(x, y, col) {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y, col));
  }
}

function spawnPowerup() {
  if (frameCount % 300 === 0 && powerups.length < 3) { // Every 5 seconds
     let r = random();
     let type = "BONUS";
     if(r < 0.4) type = "FREEZE";
     else if(r < 0.7) type = "SHIELD";
     
     let pos = getValidSpawnPosition();
     powerups.push({pos: pos, type: type});
  }
}

function updateObstacles() {
  for(let obs of obstacles) {
    obs.pos.add(obs.vel);
    obs.angle += obs.spin;
    
    // Bounce off walls
    if(obs.pos.x < 0 || obs.pos.x > width) obs.vel.x *= -1;
    if(obs.pos.y < 0 || obs.pos.y > height) obs.vel.y *= -1;
  }
}

// Main Game Loop
function draw() {
  // Trail effect for cool visuals
  background(0, 0, 0, 50);

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].applyForce(createVector(0, 0.1)); // Gravity
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }

  // Update and draw Bombs (Layered below characters usually, but indicators up top)
  manageHazards();

  if (gameState === "MENU") {
    drawMenu();
  } else if (gameState === "PLAY_SNAKE") {
    playAsSnake();
  } else if (gameState === "PLAY_APPLE") {
    playAsApple();
  } else if (gameState === "GAME_OVER") {
    drawGameOver();
  }
}

// --- GAME LOGIC ---

function playAsSnake() {
  // --- PLAYER IS SNAKE ---
  // Goal: Catch the RUNNING apple
  
  checkLevelProgression();
  
  updateObstacles();
  spawnPowerup();
  spawnRandomHazards(); // Bombs logic
  
  drawObstacles();
  drawPowerups();
  drawHazards();       

  // Smart Apple Logic (It runs away!)
  let head = vehicles[0];
  let distToSnake = p5.Vector.dist(apple, head.pos);
  
  if (distToSnake < 200) {
    // Flee behavior
    let fleeForce = p5.Vector.sub(apple, head.pos);
    fleeForce.setMag(4); // Run speed
    appleVel.lerp(fleeForce, 0.1);
  } else {
    // Slow down if safe
    appleVel.mult(0.95);
  }
  
  apple.add(appleVel);
  // Keep apple on screen
  apple.x = constrain(apple.x, 20, width-20);
  apple.y = constrain(apple.y, 20, height-20);
  
  drawApple(apple.x, apple.y, true);

  if (checkHazardCollisions(head.pos, head.r)) { // Check new hazards
        gameState = "GAME_OVER";
         if (score > highScore) highScore = score;
  }

  // 1. Snake Movement (Follow Mouse)
  let target = createVector(mouseX, mouseY);
  
  // Powerup Logic
  handlePowerupTimers();

  // CHECK OBSTACLE COLLISION
  if (!shieldActive) {
    for(let obs of obstacles) {
        if(head.pos.dist(obs.pos) < head.r + obs.size/2) {
            spawnExplosion(head.pos.x, head.pos.y, color(255, 50, 50));
            gameState = "GAME_OVER";
            if (score > highScore) highScore = score;
        }
    }
  }

  // CHECK POWERUP COLLISION
  for(let i = powerups.length-1; i>=0; i--){
      let p = powerups[i];
      if(head.pos.dist(p.pos) < head.r + 15) {
          applyPowerup(p.type);
          powerups.splice(i, 1);
      }
  }
  
  vehicles.forEach((vehicle, index) => {
    let steeringForce;
    if (index === 0) {
      steeringForce = vehicle.arrive(target);
    } else {
       let vehiculePrecedent = vehicles[index - 1];
       steeringForce = vehicle.arrive(vehiculePrecedent.pos, 20);
    }
    vehicle.applyForce(steeringForce);
    vehicle.update();
    vehicle.show();
  });
  
  // Draw Shield visual on Head
  if(shieldActive) drawShield(head.pos);

  // 2. Collision Detection (Head vs Apple)
  if (head.pos.dist(apple) < head.r + 20) {
    spawnExplosion(apple.x, apple.y, color(100, 255, 100)); // Green 'juice'
    score++;
    if (score % 5 === 0) spawnObstacles(1); // Difficulty Spike
    spawnApple();
    
    // Grow Snake
    let last = vehicles[vehicles.length - 1];
    vehicles.push(new Snake(last.pos.x, last.pos.y, vehicles.length));
  }

  // Draw HUD
  drawHUD();
}

function playAsApple() {
  // --- PLAYER IS APPLE ---
  // Goal: Survive the Hunters
  
  checkLevelProgression();

  updateObstacles();
  spawnPowerup();
  spawnRandomHazards();

  drawObstacles();
  drawPowerups();
  drawHazards();

  handlePowerupTimers();

  // 1. Player is the Apple (Mouse Position)
  apple.x = mouseX;
  apple.y = mouseY;
  drawApple(apple.x, apple.y, false); // false means 'not a food item', but the player avatar
  
  if(shieldActive) drawShield(apple);

  // CHECK OBSTACLE COLLISION (PLAYER)
  if (!shieldActive) {
      if (checkHazardCollisions(createVector(mouseX, mouseY), 15)) {
        spawnExplosion(mouseX, mouseY, color(255, 0, 0));
        gameState = "GAME_OVER";
         if (score > highScore) highScore = score;
      }

      for(let obs of obstacles) {
          if(dist(mouseX, mouseY, obs.pos.x, obs.pos.y) < 15 + obs.size/2) {
              spawnExplosion(mouseX, mouseY, color(255, 255, 0));
              gameState = "GAME_OVER";
              if (score > highScore) highScore = score;
          }
      }
  }

  // CHECK POWERUP COLLISION (PLAYER)
  for(let i = powerups.length-1; i>=0; i--){
      let p = powerups[i];
      if(dist(mouseX, mouseY, p.pos.x, p.pos.y) < 15 + 15) {
          applyPowerup(p.type);
          powerups.splice(i, 1);
      }
  }


  // 2. Snake Movement (Chases Apple/Mouse)
  let target = apple; 
  let head = vehicles[0];
  
  if (snakeFrozen) {
      vehicles.forEach(v => v.show());
      push();
      fill(0, 255, 255);
      textAlign(CENTER);
      textSize(20);
      text("FROZEN!", head.pos.x, head.pos.y - 30);
      pop();
  } else {
      vehicles.forEach((vehicle, index) => {
        let steeringForce;
        if (index === 0) {
          steeringForce = vehicle.arrive(target);
        } else {
           let vehiculePrecedent = vehicles[index - 1];
           steeringForce = vehicle.arrive(vehiculePrecedent.pos, 20);
        }
        vehicle.applyForce(steeringForce);
        vehicle.update();
        vehicle.show();
      });
  }

  // 3. Survival Scoring
  if (frameCount % 60 === 0 && !snakeFrozen) {
    score++;
    if(score % 10 === 0) spawnObstacles(1); // Harder over time
  }

  // 4. Collision Detection (Head vs Player/Apple)
  if (!shieldActive && head.pos.dist(apple) < head.r + 15) {
    spawnExplosion(apple.x, apple.y, color(255, 0, 0));
    // CAUGHT!
    gameState = "GAME_OVER";
    if (score > highScore) highScore = score;
  }
  
  drawHUD();
}

function handlePowerupTimers() {
    if(snakeFrozen) {
        freezeTimer--;
        if(freezeTimer <= 0) snakeFrozen = false;
    }
    if(shieldActive) {
        shieldTimer--;
        if(shieldTimer <= 0) shieldActive = false;
    }
}

function applyPowerup(type) {
    if (type === "BONUS") {
        score += 5;
    } else if (type === "FREEZE") {
        snakeFrozen = true;
        freezeTimer = 180; // 3s
    } else if (type === "SHIELD") {
        shieldActive = true;
        shieldTimer = 300; // 5s protection
    }
}

// --- LEVELS & HAZARDS LOGIC ---

function checkLevelProgression() {
  let leveledUp = false;
  
  if(gameState === "PLAY_SNAKE") {
      // Increase level every 5 points
      let currentLevel = Math.floor(score / 5) + 1; 
      if(currentLevel > level) {
          level = currentLevel;
          leveledUp = true;
      }
  } else {
      // Increase level every 8 points (time)
      let currentLevel = Math.floor(score / 8) + 1;
      if(currentLevel > level) {
          level = currentLevel;
          leveledUp = true;
      }
  }
  
  if (leveledUp) {
      // Difficulty Increase
      // Add 1 obstacle per level
      spawnObstacles(1);
      
      // Visual Feedback
      spawnExplosion(width/2, height/2, color(0, 255, 255));
  }
}

function spawnRandomHazards() {
  if (level < 2) return; // Helpers start at level 2

  // Bomb Spawning
  // Chance increases with level: 0.5% per frame + level scaling
  if (random(100) < 0.2 + (level * 0.05)) {
     if(bombs.length < level + 1) { // Cap bombs by level
         let x = random(50, width-50);
         let y = random(50, height-50);
         bombs.push(new Bomb(x, y));
     }
  }
  
  // Enemy Snake Spawning (Apple Mode or High Level Snake Mode)
  if (level >= 3 && frameCount % 600 === 0) { // Every 10s roughly
      let y = random(100, height-100);
      let speed = random(3, 3 + level);
      if (random() < 0.5) speed *= -1;
      enemySnakes.push(new EnemySnake(y, speed));
  }
}

function manageHazards() {
  // Update Bombs
  for(let i = bombs.length - 1; i >= 0; i--) {
      bombs[i].update();
      if(bombs[i].isDead) bombs.splice(i, 1);
  }
  
  // Update Enemy Snakes
  for(let i = enemySnakes.length - 1; i >= 0; i--) {
      enemySnakes[i].update();
      if(enemySnakes[i].isOffScreen()) enemySnakes.splice(i, 1);
  }
}

function drawHazards() {
    for(let b of bombs) b.show();
    for(let e of enemySnakes) e.show();
}

function checkHazardCollisions(pos, radius) {
    // Check Bombs
    for(let b of bombs) {
        if(b.checkCollision(pos, radius)) return true;
    }
    
    // Check Enemies
    for(let e of enemySnakes) {
        if(e.checkCollision(pos, radius)) return true;
    }
    
    return false;
}

// --- VISUALS & UI ---

function drawObstacles() {
    noFill();
    strokeWeight(2);
    for(let obs of obstacles) {
        push();
        translate(obs.pos.x, obs.pos.y);
        rotate(obs.angle);
        
        // Spike ball visual
        stroke(150, 50, 50); // Reddish grey
        fill(50, 0, 0); 
        beginShape();
        for (let a = 0; a < TWO_PI; a += 0.5) {
            let r = (obs.size / 2);
            if (a % 1.0 > 0.4) r += 10; // Spikes
            let sx = r * cos(a);
            let sy = r * sin(a);
            vertex(sx, sy);
        }
        endShape(CLOSE);
        
        // Inner Core
        fill(255, 100, 100);
        noStroke();
        circle(0, 0, obs.size/3);
        
        pop();
    }
}

function drawPowerups() {
    noStroke();
    for(let p of powerups) {
        push();
        translate(p.pos.x, p.pos.y);
        // Bobbing
        translate(0, sin(frameCount * 0.1) * 5);
        
        if (p.type === "BONUS") {
            fill(255, 215, 0); 
            circle(0, 0, 25);
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(12);
            text("+5", 0, 0);
        } else if (p.type === "FREEZE") {
            fill(0, 255, 255);
            rectMode(CENTER);
            rect(0, 0, 20, 20);
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(8);
            text("ICE", 0, 0);
        } else if (p.type === "SHIELD") {
            fill(100, 100, 255);
            circle(0, 0, 25);
            noFill();
            stroke(255);
            strokeWeight(2);
            circle(0, 0, 18);
             noStroke();
            fill(255);
            textSize(8);
            textAlign(CENTER, CENTER);
            text("DEF", 0, 0);
        }
        pop();
    }
}

function drawShield(pos) {
    push();
    translate(pos.x, pos.y);
    noFill();
    stroke(100, 100, 255, 200);
    strokeWeight(4);
    let s = 60 + sin(frameCount * 0.2) * 5;
    circle(0, 0, s);
    pop();
}

function drawApple(x, y, isFood) {
  push();
  translate(x, y);
  if (isFood) {
    // Apple appearance
    fill(255, 80, 80);
    noStroke();
    circle(0, 0, 30);
    fill(100, 255, 100);
    ellipse(5, -10, 10, 5); // Leaf
    
    // Fear expression if moving fast
    if (appleVel.mag() > 1) {
        fill(0);
        ellipse(-5, 0, 5, 5); // Eyes
        ellipse(5, 0, 5, 5);
        noFill();
        stroke(0);
        arc(0, 8, 10, 10, PI, 0); // Frown/O-mouth
    }
  } else {
    // Player Apple Avatar (Gold/Shiny)
    fill(255, 215, 0); 
    noStroke();
    circle(0, 0, 30);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(10);
    text("YOU", 0, 0);
  }
  pop();
}

function drawMenu() {
  textAlign(CENTER, CENTER);
  fill(0, 255, 0);
  textSize(80);
  text("SNAKE VS APPLE", width/2, height/3);

  textSize(30);
  fill(255);
  text("Press '1' to be the SNAKE (Hunt)", width/2, height/2);
  text("Press '2' to be the APPLE (Survive)", width/2, height/2 + 50);
  
  textSize(18);
  fill(200);
  text("Now with Moving Spikes & Shields!", width/2, height/2 + 100);
}

function drawGameOver() {
  textAlign(CENTER, CENTER);
  fill(255, 50, 50);
  textSize(80);
  text("GAME OVER", width/2, height/3);

  fill(255);
  textSize(40);
  text("Score: " + score, width/2, height/2); 
  textSize(20);
  text("High Score: " + highScore, width/2, height/2 + 50);
  text("Press 'M' for Menu", width/2, height/2 + 90);
}

function drawHUD() {
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  text("High Score: " + highScore, 20, 45);
  
  // Level Display
  fill(255, 215, 0);
  textSize(24);
  text("LEVEL " + level, width - 120, 20);

  if (gameState === "PLAY_APPLE") {
    fill(150, 150, 150);
    text("Survive!", 20, 80);
  } else {
      fill(150, 150, 150);
      text("Hunter!", 20, 80);
  }
  
  if (shieldActive) {
      fill(100, 100, 255);
      text("SHIELD: " + Math.ceil(shieldTimer/60), 20, 110);
  }
}

// --- INPUTS ---

function keyPressed() {
  if (gameState === "MENU") {
    if (key === '1') {
      resetGame("SNAKE");
    } else if (key === '2') {
      resetGame("APPLE");
    }
  } else if (gameState === "GAME_OVER") {
    if (key === 'm' || key === 'M') {
      gameState = "MENU";
    }
  }
}
