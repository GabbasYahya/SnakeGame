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

    // Dynamic color (User Selection)
    colorMode(HSB);
    // Use playerHue (global)
    let hue = (playerHue + (this.index*2)) % 360; // Gradient based on generic HUE
    // Add subtle pulsation to saturation
    let sat = 200 + sin(frameCount * 0.1 + this.index * 0.1) * 55;
    
    fill(hue, sat, 255);
    noStroke();

    if (this.index === 0) {
      // --- HEAD DRAWING ---
      fill(playerHue, 255, 200); // Main head color
      
      // Cyberpunk / Robot Snake look
      // Outline
      stroke((playerHue + 120)%360, 255, 255);
      strokeWeight(2);
      
      // Geometrical Head
      beginShape();
      vertex(15, 0);
      vertex(-5, -15);
      vertex(-15, -10);
      vertex(-15, 10);
      vertex(-5, 15);
      endShape(CLOSE);

      // Glowing Visor Eyes (One strip)
      noStroke();
      fill(255, 0, 100); // Neon Pink Eye
      rect(-5, -5, 15, 10, 2); 
      
      // Detail lines
      stroke(0, 100, 0);
      strokeWeight(1);
      line(-5, 0, 10, 0);
      
    } else {
      // --- BODY DRAWING ---
      let size = 20;

      // Hexagonal Scales Effect
      noStroke();
      fill(hue, sat, 200); 
      
      // Draw a polygon (Hexagon)
      beginShape();
      for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
          let sx = cos(a) * (size/2);
          let sy = sin(a) * (size/2);
          vertex(sx, sy);
      }
      endShape(CLOSE);
      
      // Inner light
      fill(255, 255, 255, 100);
      circle(0, 0, size/3);
    }

    pop();
    // Reset back to RGB for other elements
    colorMode(RGB);
  }
}