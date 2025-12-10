let balls = [];

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y - 20;
    this.d = random(30, 75);
    this.velY = random(noise(100,100,100)*15);

    // FIXED
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }
  
  update(){
    this.y += this.velY;
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

  // Spawns one new ball PER FRAME
  balls.push(new Ball(random(0, width),-10));
}