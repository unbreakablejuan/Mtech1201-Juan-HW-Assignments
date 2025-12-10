let balls = [];

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.d = random(30, 75);
    this.clickPos = mouseX

    this.velY = -5;     // base upward speed
    this.velX = 0;      // start neutral

    this.steerStrength = 1-sin(map(this.x,0,width,0,PI)); // how strongly the mouse influences direction

    // random color
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }
  
  update(){

    // --- Flow-field steering based on mouse position ---
    if (this.clickPos < width / 2) {
      // steer left
      this.velX -= this.steerStrength;
    } else {
      // steer right
      this.velX += this.steerStrength;
    }

    // limit max sideways speed
    this.velX = constrain(this.velX, -6, 6);

    // updating positions
    this.y += this.velY;
    this.x += this.velX;
  }

  show() {
    fill(this.r, this.g, this.b);
    noStroke();
    circle(this.x, this.y, this.d);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255, 50);

  for (let b of balls) {
    b.update();
    b.show();
  }
}

function mouseDragged(){
  balls.push(new Ball(mouseX, mouseY));
}