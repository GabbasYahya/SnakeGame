let nbVehicules = 10;
let vehicles = [];
let apple;
let appleVel; // Moving apple velocity
let score = 0;
let highScore = 0;
let bestName = "";
let level = 1;
let levelMessageTimer = 0;
let levelMessageText = "";
let gameState = "MENU"; // MENU, PLAY_SNAKE, PLAY_APPLE, GAME_OVER
let lastGameState = "PLAY_SNAKE";
let font;
let gameOverProcessed = false;
let lives = 3;

// Obstacles & Powerups
let obstacles = []; // Array of Objects {pos, vel, angle, type}
let powerups = [];  // Array of Objects {pos, type}
let particles = []; // Explosion particles
let bombs = [];
let enemySnakes = [];
let warnings = []; // Visual indicators for incoming hazards
let boss = null;
let bgPulse = 0;

let snakeFrozen = false;
let freezeTimer = 0;

// Powerup States
let shieldActive = false;
let shieldTimer = 0;

let applesEaten = 0; // For level progression independent of score
let playerHue = 120; // Default Green
let inputName; // Define inputName globally
let leaderboard = []; // Define leaderboard globally
let volumeSlider; // Volume control

// Preload resources
function preload() {
  font = loadFont('./assets/inconsolata.otf');
  
  // Load background music
  soundFormats('mp3', 'ogg');
  // Make sure you have a file named 'music.mp3' in your assets folder!
  bgMusic = loadSound('assets/NCS x Geometry Dash Mix  NCS - Copyright Free Music.mp3', 
    () => console.log("Music loaded successfully"), 
    () => console.log("Warning: Music file not found")
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Try to start music on launch (Autoplay policy might block it until interaction)
  if (bgMusic) {
    bgMusic.setVolume(0.3);
  }
  
  // Load Leaderboard from local storage
  let savedLb = localStorage.getItem('snakeLeaderboard');
  if (savedLb) {
      leaderboard = JSON.parse(savedLb);
  }
  
  // Initialize standard snake size
  resetSnake(10);
  spawnApple();
  
  // Volume Slider
  volumeSlider = createSlider(0, 1, 0.3, 0.01);
  volumeSlider.position(width - 150, 10);
  volumeSlider.style('width', '100px');
  
  let volLabel = createDiv('Volume');
  volLabel.position(width - 150, 30);
  volLabel.style('color', 'white');
  volLabel.style('font-family', 'sans-serif');
}

function resetGame(mode) {
  score = 0;
  level = 1;
  applesEaten = 0; // Reset progress
  lives = 3;
  shieldActive = false;
  gameOverProcessed = false;
  
  // Start Music if not playing
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.setVolume(0.3);
    bgMusic.loop();
  }

  // Dynamic Obstacles
  obstacles = [];
  spawnObstacles(5); // Start with fewer for Level 1
  
  powerups = [];
  bombs = [];
  enemySnakes = [];
  warnings = [];
  particles = [];
  boss = null;
  
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
    let x = random(50, width-50);
    let y = random(50, height-50);
    let size = random(40, 70);
    let o = new Obstacle(x, y, size);
    // override spin and initial angle for variety
    o.angle = random(TWO_PI);
    o.spin = random(-0.05, 0.05);
    obstacles.push(o);
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
  let attempts = 0;
  let pos;
  let valid = false;
  
  // Robust Spawning
  while(!valid && attempts < 100) {
    pos = createVector(random(50, width-50), random(50, height-50));
    valid = true;
    for(let obs of obstacles) {
      if(pos.dist(obs.pos) < obs.size + 40) valid = false; // Increased margin
    }
    attempts++;
  }
  
  // Fallback if no valid spot found (to prevent disappearance)
  if (!valid) {
      pos = createVector(width/2, height/2);
  }

  apple = pos;
  appleVel = createVector(0,0);
}

function spawnExplosion(x, y, col) {
  bgPulse = 20; // Trigger background pulse
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y, col));
  }
}

function spawnPowerup() {
  if (frameCount % 300 === 0 && powerups.length < 3) { // Every 5 seconds
     let r = random();
     let type = "BONUS";
     if(r < 0.6) type = "SHIELD";
     
     let pos = getValidSpawnPosition();
     powerups.push({pos: pos, type: type});
  }
}

function updateObstacles() {
  for(let obs of obstacles) {
    // use Vehicle.update to apply velocity
    obs.update();
    obs.angle += obs.spin;

    // Bounce off walls by flipping velocity
    if(obs.pos.x < 0 || obs.pos.x > width) obs.vel.x *= -1;
    if(obs.pos.y < 0 || obs.pos.y > height) obs.vel.y *= -1;
  }
}

// Main Game Loop
function draw() {
  // Update Volume
  if (bgMusic && volumeSlider) {
      bgMusic.setVolume(volumeSlider.value());
  }

  drawBackground();
  
  // Draw Warnings
  for (let i = warnings.length - 1; i >= 0; i--) {
      let w = warnings[i];
      w.timer--;
      
      // Pulse red glow at the edge
      noStroke();
      let alpha = map(sin(frameCount * 0.5), -1, 1, 100, 255);
      fill(255, 0, 0, alpha);
      
      if (w.side === 'LEFT') {
          rect(0, w.y - 20, 30, 40);
          triangle(40, w.y, 10, w.y - 10, 10, w.y + 10);
      } else if (w.side === 'RIGHT') {
          rect(width - 30, w.y - 20, 30, 40);
          triangle(width - 40, w.y, width - 10, w.y - 10, width - 10, w.y + 10);
      } else if (w.side === 'TOP') {
          rect(w.x - 20, 0, 40, 30);
          triangle(w.x, 40, w.x - 10, 10, w.x + 10, 10);
      } else if (w.side === 'BOTTOM') {
          rect(w.x - 20, height - 30, 40, 30);
          triangle(w.x, height - 40, w.x - 10, height - 10, w.x + 10, height - 10);
      }
      
      if (w.timer <= 0) {
          // Spawn the actual enemy
          enemySnakes.push(new EnemySnake(w.x, w.y, w.vx, w.vy));
          warnings.splice(i, 1);
      }
  }
  
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
    // processGameOverOnce(); // Removed, handled in loseLife/drawGameOver
  } else if (gameState === "LEVEL_TRANSITION") {
    // Draw game elements in frozen state
    drawObstacles();
    vehicles.forEach(v => v.show());
    if (typeof apple !== 'undefined') drawApple(apple.x, apple.y, lastGameState === "PLAY_SNAKE");
    drawHUD();
    
    // Check if transition finished
    if (levelMessageTimer <= 0) {
        gameState = lastGameState;
    }
  }

  // Global debug overlays for obstacles & food
  if (Vehicle.debug) {
    // Obstacles: use their debugDraw (they inherit Vehicle)
    for (let obs of obstacles) {
      if (typeof obs.debugDraw === 'function') obs.debugDraw({ showSelfCircle: true });
      // draw velocity vector for obstacle
      if (obs.vel) {
        push();
        stroke(Vehicle.debugObstacleColor || '#FF0000');
        strokeWeight(2);
        line(obs.pos.x, obs.pos.y, obs.pos.x + obs.vel.x * 10, obs.pos.y + obs.vel.y * 10);
        pop();
      }
      // small center marker
      push();
      noStroke();
      fill(Vehicle.debugObstacleColor || '#FF0000');
      circle(obs.pos.x, obs.pos.y, 6);
      pop();
    }

    // Apple / food debug: position and velocity
    if (typeof apple !== 'undefined' && apple) {
      push();
      noFill();
      stroke(0, 255, 0, 180);
      strokeWeight(2);
      circle(apple.x, apple.y, 30);
      // velocity vector
      if (typeof appleVel !== 'undefined' && appleVel) {
        stroke(0, 255, 0);
        strokeWeight(2);
        line(apple.x, apple.y, apple.x + appleVel.x * 10, apple.y + appleVel.y * 10);
      }
      pop();
    }
  }

  // Level-up message overlay
  if (levelMessageTimer > 0) {
    let alpha = map(levelMessageTimer, 0, 180, 0, 255);
    push();
    textAlign(CENTER, CENTER);
    textSize(56);
    fill(255, 215, 0, alpha);
    stroke(0, 150, 200, alpha);
    strokeWeight(3);
    text(levelMessageText, width / 2, height / 3);
    pop();
    levelMessageTimer--;
  }
}

// --- GAME LOGIC ---

function playAsSnake() {
  // --- PLAYER IS SNAKE ---
  // Goal: Catch the RUNNING apple
  
  checkLevelProgression();
  
  updateObstacles();
  spawnPowerup();
  
  // BOSS LOGIC OR NORMAL LOGIC
  if (boss) {
    // --- BOSS FIGHT ---
    playBossFight();
  } else {
    // --- NORMAL GAME ---
    updateObstacles();
    spawnRandomHazards(); // Bombs logic
    drawObstacles();
    
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

    // 2. Collision Detection (Head vs Apple)
    if (head.pos.dist(apple) < head.r + 20) {
      spawnExplosion(apple.x, apple.y, color(100, 255, 100)); // Green 'juice'
      score += 1; // +1 score per apple
      applesEaten++;
      if (applesEaten % 5 === 0) spawnObstacles(1); // Difficulty Spike based on progression
      spawnApple();
    }
  }

  drawPowerups();
  drawHazards();       

  let head = vehicles[0];

  if (checkHazardCollisions(head.pos, head.r)) { // Check new hazards
        loseLife();
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
            loseLife();
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
    if (typeof vehicle.debugDraw === 'function') vehicle.debugDraw({ showSelfCircle: true });
  });
  
  // Draw Shield visual on Head
  if(shieldActive) drawShield(head.pos);

  // Draw HUD
  drawHUD();
}

function playBossFight() {
    let head = vehicles[0];
    
    // Ensure obstacles (spikes) exist for logic
    if (obstacles.length < 3) spawnObstacles(1);
    drawObstacles();
    
    // Warn User
    push();
    textAlign(CENTER);
    fill(255, 0, 0);
    textSize(16);
    text("LURE BOSS INTO SPIKES!", width/2, height - 50);
    pop();
    
    // Update Boss
    boss.update(head.pos);
    boss.show();
    
    // Boss Attacks Player
    if (head.pos.dist(boss.pos) < head.r + boss.r) {
        spawnExplosion(head.pos.x, head.pos.y, color(255, 0, 0));
        loseLife();
        // Push boss away to prevent instant re-kill
        let push = p5.Vector.sub(boss.pos, head.pos).setMag(200);
        boss.pos.add(push);
    }
    
    // Boss hits Spikes
    if (boss.checkSpikeCollision(obstacles)) {
        // Boss took damage
        if (boss.isDead()) {
            // Victory
            spawnExplosion(boss.pos.x, boss.pos.y, color(255, 215, 0)); // Big Gold Explosion
            boss = null;
            score += 50; // Big Bonus
            gameState = "LEVEL_TRANSITION";
            levelTransitionTimer = 180;
            spawnExplosion(width/2, height/2, color(0, 255, 255));
        }
    }
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
        loseLife();
      }

      for(let obs of obstacles) {
          if(dist(mouseX, mouseY, obs.pos.x, obs.pos.y) < 15 + obs.size/2) {
              spawnExplosion(mouseX, mouseY, color(255, 255, 0));
              loseLife();
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
      vehicles.forEach(v => { if (typeof v.debugDraw === 'function') v.debugDraw({ showSelfCircle: true }); });
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
        if (typeof vehicle.debugDraw === 'function') vehicle.debugDraw({ showSelfCircle: true });
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
    if(shieldActive) {
        shieldTimer--;
        if(shieldTimer <= 0) shieldActive = false;
    }
}

function applyPowerup(type) {
    if (type === "BONUS") {
        score += 2;
    } else if (type === "SHIELD") {
        shieldActive = true;
        shieldTimer = 300; // 5s protection
    }
}

// --- LEVELS & HAZARDS LOGIC ---

function checkLevelProgression() {
  if (boss) return; // No level progression during boss fight
  
  let leveledUp = false;
  // Progress based on APPLES EATEN, not Score. 
  let targetLevel = Math.floor(applesEaten / 5) + 1; 
  
  if(targetLevel > level) {
      level = targetLevel;
      leveledUp = true;
  }
  
  if (leveledUp) {
      // BOSS WAVE CHECK (Every 5 levels)
      if (gameState === "PLAY_SNAKE" && level % 5 === 0) {
          boss = new Boss(width/2, -100); // Spawn Boss
          levelMessageText = "BOSS FIGHT!";
          levelMessageTimer = 180;
      } else {
          // Standard transition
          lastGameState = gameState;
          gameState = "LEVEL_TRANSITION";
          levelTransitionTimer = 120; 
          spawnObstacles(1);
          spawnExplosion(width/2, height/2, color(0, 255, 255));
          levelMessageText = "LEVEL " + level;
          levelMessageTimer = 180;
      }
  }
}

function drawBackground() {
  colorMode(HSB); 
  
  // Electro Theme Check: Change theme every 5 levels (Boss Worlds)
  // Instead of constant shifting, pick a static theme for the world
  let worldIndex = Math.floor((level - 1) / 5);
  let baseHue = (worldIndex * 60) % 360; // Changes color completely every 5 levels
  
  let hueVal = baseHue;
  let satVal = 80;
  let briVal = 10 + bgPulse;
  
  if (boss) {
      // During boss: Flashing Red/Theme mix
      hueVal = (frameCount * 5) % 360; 
      satVal = 100;
      briVal = 20 + bgPulse;
  }

  background(hueVal, satVal, briVal);
  
  colorMode(RGB);
  
  // Decay pulse
  bgPulse *= 0.9;
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
  
  // Enemy Snake Warning Logic
  if (level >= 3 && frameCount % 600 === 0) { // Every 10s roughly
      let side = random(['LEFT', 'RIGHT', 'TOP', 'BOTTOM']);
      let speed = random(3, 3 + level);
      
      let w = {
          x: 0, y: 0, vx: 0, vy: 0, 
          side: side, 
          timer: 60 
      };

      if(side === 'LEFT') {
          w.y = random(100, height-100);
          w.vx = speed;
          w.x = -50; 
      } else if (side === 'RIGHT') {
          w.y = random(100, height-100);
          w.vx = -speed;
          w.x = width + 50; 
      } else if (side === 'TOP') {
          w.x = random(100, width-100);
          w.vy = speed;
          w.y = -50;
      } else if (side === 'BOTTOM') {
          w.x = random(100, width-100);
          w.vy = -speed;
          w.y = height + 50;
      }
      
      warnings.push(w);
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

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameState = "GAME_OVER";
        checkLeaderboard();
    } else {
        // Respawn safe
        spawnExplosion(width/2, height/2, color(255));
        if (gameState === "PLAY_SNAKE") resetSnake(10); // Fixed size
        // Brief invulnerability
        shieldActive = true;
        shieldTimer = 120; // 2 seconds
    }
}

// --- LEADERBOARD & DATA ---

function checkLeaderboard() {
    // Check if score qualifies for top 5
    let qualifies = false;
    if (leaderboard.length < 5) qualifies = true;
    else if (score > leaderboard[leaderboard.length-1].score) qualifies = true;
    
    if (qualifies && !inputName) {
        inputName = createInput('');
        inputName.position(width/2 - 100, height/2 + 180);
        inputName.size(200);
        inputName.attribute('placeholder', 'Enter Name (Max 6)');
        inputName.attribute('maxlength', '6');
        inputName.style('font-size', '20px');
        
        let subBtn = createButton('Save');
        subBtn.position(width/2 + 110, height/2 + 180);
        subBtn.style('font-size', '20px');
        subBtn.mousePressed(saveScore);
        
        // Store button on input for removal
        inputName.btn = subBtn; 
    }
}

function saveScore() {
    let name = inputName.value() || "Anon";
    leaderboard.push({name: name, score: score});
    // Sort descending
    leaderboard.sort((a, b) => b.score - a.score);
    // Keep top 5
    if(leaderboard.length > 5) leaderboard = leaderboard.slice(0, 5);
    
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    // Cleanup
    inputName.btn.remove();
    inputName.remove();
    inputName = null;
    gameState = "MENU"; // Go back to menu after saving
}

// --- VISUALS & UI ---

function drawObstacles() {
  for(let obs of obstacles) {
    if (typeof obs.show === 'function') obs.show();
  }
}

function drawPowerups() {
    noStroke();
    for(let p of powerups) {
        push();
        translate(p.pos.x, p.pos.y);
        // Bobbing
        translate(0, sin(frameCount * 0.1) * 5);
        
        if(p.type === "BONUS") {
            fill(255, 215, 0); 
            circle(0, 0, 25);
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(12);
            text("+5", 0, 0);
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
  text("SNAKE VS APPLE", width/2, height/3 - 50);

  textSize(30);
  fill(255);
  text("Press '1' to Start Game", width/2, height/2 - 20);

  // Draw clickable start buttons (also respond to keys 1/2)
  let btnW = 220;
  let btnH = 56;
  let gap = 40;
  let total = btnW * 2 + gap;
  let startX = width/2 - total/2;
  let y = height/2 + 40;

  // Button 1 - Play Snake
  push();
  rectMode(CORNER);
  stroke(200);
  fill(30, 120, 30);
  rect(startX, y, btnW, btnH, 10);
  fill(255);
  noStroke();
  textSize(22);
  textAlign(CENTER, CENTER);
  text("1 — Play Snake", startX + btnW/2, y + btnH/2);
  pop();

  // Button 2 - Play Apple
  push();
  stroke(200);
  fill(80, 80, 160);
  rect(startX + btnW + gap, y, btnW, btnH, 10);
  fill(255);
  noStroke();
  textSize(22);
  textAlign(CENTER, CENTER);
  text("2 — Play Apple (Survive)", startX + btnW + gap + btnW/2, y + btnH/2);
  pop();
  
  textSize(18);
  fill(200);
  text("Now with Moving Spikes & Shields!", width/2, height/2 + 20);
  
  // Color Picker UI (moved down to avoid overlapping buttons)
  push();
  textSize(24);
  fill(255);
  text("Choose Snake Color:", width/2, height/2 + 120);
  
  // Draw Color Options
  colorMode(HSB);
  let colors = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Purple
  let yPos = height/2 + 160;
  let colorStartX = width/2 - ((colors.length-1) * 30);
  
  for(let i=0; i<colors.length; i++) {
      let c = colors[i];
      stroke(255);
      if (playerHue === c) {
          strokeWeight(4); // Selected highlight
        fill(c, 255, 255);
        circle(colorStartX + i*60, yPos, 45); 
      } else {
          strokeWeight(1);
          fill(c, 200, 200);
        circle(colorStartX + i*60, yPos, 30);
      }
  }
  colorMode(RGB);
  pop();
  
  // Draw Leaderboard
  fill(255, 215, 0);
  textSize(24);
    text("TOP 5 LEGENDS", width/2, height/2 + 240);
  
    textSize(20);
    fill(255);
    if(typeof leaderboard !== 'undefined') {
      for(let i=0; i<leaderboard.length; i++) {
       let entry = leaderboard[i];
       text(`${i+1}. ${entry.name}: ${entry.score}`, width/2, height/2 + 270 + (i*25));
      }
    }

  // Export / Import CSV buttons
  let csvBtnW = 180;
  let csvBtnH = 36;
  let csvY = height/2 + 420;
  let csvGap = 24;
  push();
  rectMode(CENTER);
  fill(60,180,60);
  stroke(200);
  rect(width/2 - csvBtnW/1.5, csvY, csvBtnW, csvBtnH, 8);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('Export Scores (CSV)', width/2 - csvBtnW/1.5, csvY);
  pop();

  push();
  rectMode(CENTER);
  fill(60,120,200);
  stroke(200);
  rect(width/2 + csvBtnW/1.5, csvY, csvBtnW, csvBtnH, 8);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('Import Scores (CSV)', width/2 + csvBtnW/1.5, csvY);
  pop();
}

function mousePressed() {
    if (gameState === "MENU") {
        let colors = [0, 60, 120, 180, 240, 300];
        let yPos = height/2 + 100;
        let startX = width/2 - ((colors.length-1) * 30);
        
        for(let i=0; i<colors.length; i++) {
             let bx = startX + i*60;
             let by = yPos;
             if (dist(mouseX, mouseY, bx, by) < 25) {
                 playerHue = colors[i];
                 // Update preview snake immediately
                 resetSnake(10);
             }
        }

        // Check menu start buttons (same geometry as in drawMenu)
        let btnW = 220;
        let btnH = 56;
        let gap = 40;
        let total = btnW * 2 + gap;
        let bx = width/2 - total/2;
        let by = height/2 + 40;

        // Left button -> Play Snake
        if (mouseX >= bx && mouseX <= bx + btnW && mouseY >= by && mouseY <= by + btnH) {
          resetGame("SNAKE");
          return;
        }

        // Right button -> Play Apple
        let bx2 = bx + btnW + gap;
        if (mouseX >= bx2 && mouseX <= bx2 + btnW && mouseY >= by && mouseY <= by + btnH) {
          resetGame("APPLE");
          return;
        }
        
        // Export / Import CSV buttons (same positions as drawn in drawMenu)
        let csvBtnW = 180;
        let csvY = height/2 + 420;
        let leftCsvX = width/2 - csvBtnW/1.5 - csvBtnW/2; // rectMode CENTER used in draw
        let rightCsvX = width/2 + csvBtnW/1.5 - csvBtnW/2;
        // left export
        if (mouseX >= leftCsvX && mouseX <= leftCsvX + csvBtnW && mouseY >= csvY - 18 && mouseY <= csvY + 18) {
            exportLeaderboardCSV();
            return;
        }
        // right import
        if (mouseX >= rightCsvX && mouseX <= rightCsvX + csvBtnW && mouseY >= csvY - 18 && mouseY <= csvY + 18) {
            importLeaderboardFromFile();
            return;
        }
    }
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
  if (bestName && bestName.length > 0) {
    text("Meilleur: " + bestName + " (" + highScore + ")", width/2, height/2 + 50);
  } else {
    text("Meilleur: " + highScore, width/2, height/2 + 50);
  }
  text("Press 'M' for Menu", width/2, height/2 + 90);
}

function drawHUD() {
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  if (bestName && bestName.length > 0) {
    text("Meilleur: " + bestName + " (" + highScore + ")", 20, 45);
  } else {
    text("Meilleur: " + highScore, 20, 45);
  }
  
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
  
  // Lives Display (Hearts)
  let startX = 20;
  let startY = 140; // Below Shield
  for(let i=0; i<lives; i++) {
        push();
        translate(startX + i*30, startY);
        noStroke();
        fill(255, 50, 50);
        beginShape();
        vertex(0, 0);
        bezierVertex(-10, -10, -20, 5, 0, 20);
        bezierVertex(20, 5, 10, -10, 0, 0);
        endShape(CLOSE);
        pop();
  }
}

// --- SCORE STORAGE & CSV EXPORT ---
function processGameOverOnce() {
  if (gameOverProcessed) return;
  gameOverProcessed = true;
  if (score <= 0) return;
  let name = prompt("Entrez votre nom pour enregistrer le score:", "");
  if (name === null) return; // user cancelled
  name = name.trim();
  if (name.length === 0) return;
  // Save score in localStorage (best score per user)
  saveScoreToStorage(name, score);
  loadBestFromStorage();
  alert('Score enregistré localement.');
}

// Try posting to a configured server endpoint. If succeeds, optionally trigger CSV download from server.
async function sendScoreToServer(name, score) {
  // deprecated
  return Promise.reject(new Error('Server posting deprecated in local-only mode'));
}

async function fetchHighScoreFromServer() {
  // deprecated in local-only mode
}

function saveScoreToStorage(name, score) {
  let raw = localStorage.getItem('scores');
  let scores = {};
  try { scores = raw ? JSON.parse(raw) : {}; } catch (e) { scores = {}; }
  let prev = scores[name] || 0;
  if (score > prev) scores[name] = score;
  localStorage.setItem('scores', JSON.stringify(scores));
}

function downloadScoresCSV() {
  let raw = localStorage.getItem('scores');
  let scores = {};
  try { scores = raw ? JSON.parse(raw) : {}; } catch (e) { scores = {}; }
  let lines = ['name,score'];
  for (let n in scores) {
    lines.push(escapeCsv(n) + ',' + scores[n]);
  }
  let csv = lines.join('\n');
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'scores.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export the in-memory `leaderboard` (top 5) as CSV
function exportLeaderboardCSV() {
  let lines = ['name,score'];
  for (let i = 0; i < leaderboard.length; i++) {
    let e = leaderboard[i];
    lines.push(escapeCsv(e.name) + ',' + (e.score || 0));
  }
  let csv = lines.join('\n');
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'leaderboard.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Prompt user to select a CSV file and import leaderboard rows (name,score)
function importLeaderboardFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const text = ev.target.result;
        const rows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
        const parsed = [];
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',');
          if (!cols[0]) continue;
          const name = cols[0].replace(/^"|"$/g, '').trim();
          const score = parseInt((cols[1] || '0').replace(/"/g, '').trim(), 10) || 0;
          parsed.push({ name: name, score: score });
        }
        // Merge: replace leaderboard with parsed top 5 sorted
        if (parsed.length > 0) {
          parsed.sort((a,b) => b.score - a.score);
          leaderboard = parsed.slice(0, 5);
          // Persist so page reload shows same data
          localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
        }
      } catch (err) {
        console.error('Failed to import CSV', err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function escapeCsv(str) {
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function loadBestFromStorage() {
  let raw = localStorage.getItem('scores');
  if (!raw) { highScore = 0; bestName = ''; return; }
  let scores = {};
  try { scores = JSON.parse(raw); } catch (e) { scores = {}; }
  let best = 0; let name = '';
  for (let n in scores) {
    let s = scores[n] || 0;
    if (s > best) { best = s; name = n; }
  }
  highScore = best;
  bestName = name;
}

// --- INPUTS ---

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    return;
  }
  if (gameState === "MENU") {
    if (key === '1') {
      resetGame("SNAKE");
    } else if (key === '2') {
      resetGame("APPLE");
    }
  } else if (gameState === "GAME_OVER") {
    if (key === 'm' || key === 'M') {
      gameState = "MENU";
      if(inputName) {
         inputName.btn.remove();
         inputName.remove();
         inputName = null;
      }
    }
  }
}

