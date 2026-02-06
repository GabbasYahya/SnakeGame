class Snake extends Vehicle {
  constructor(x, y, index) {
    super(x, y);
    this.index = index;
    this.r = 12; // Radius
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Only rotate the head to face the direction of movement
    if (this.index === 0 && this.vel.mag() > 0.1) {
      rotate(this.vel.heading());
    }

    // Dynamic color (Cool gradient - Green Theme)
    colorMode(HSB);
    // Gradient from bright green (90) to teal (160)
    let hue = map(this.index, 0, 50, 90, 160);
    // Add subtle pulsation to saturation
    let sat = 200 + sin(frameCount * 0.1 + this.index * 0.1) * 55;
    
    fill(hue, sat, 255);
    noStroke();

    if (this.index === 0) {
      // --- HEAD DRAWING ---
      fill(80, 255, 200); // Distinct head color
      // Main head shape
      ellipse(0, 0, 40, 30);

      // Eyes
      fill(255); // White sclera
      ellipse(10, -8, 10, 10);
      ellipse(10, 8, 10, 10);
      
      fill(0); // Black pupil
      ellipse(12, -8, 4, 4);
      ellipse(12, 8, 4, 4);

      // Tongue (animated flicker)
      if (frameCount % 20 < 10) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(20, 0, 30, 0);
        line(30, 0, 35, -3);
        line(30, 0, 35, 3);
        noStroke();
      }
    } else {
      // --- BODY DRAWING ---
      // Body segments shrink slightly towards the tail
      // But we will keep them somewhat consistent for now
      let size = map(this.index, 0, 50, 24, 10); 
      size = max(size, 8); // Minimum size

      ellipse(0, 0, size, size);
    }

    pop();
    // Reset back to RGB for other elements
    colorMode(RGB);
  }
}