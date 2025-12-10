let drips = [];

let s = 15;

function setup() {
  createCanvas(600, 600);
  background(220);
  noStroke();
}

function draw() {  
  for(let i = drips.length - 1; i >= 0; i --) {
    drips[i].update();
    if(drips[i].r < 0) {
      drips.splice(i, 1);
      continue;
    }
    drips[i].draw();
  }
}

function mouseReleased() {
  drips.push(new Drip(mouseX, 0, random(5, 10)));
}

class Drip {
  
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.startR = r;
    this.maxSpeed = map(r, 5, 10, 3, 6);
  }
  
  update() {
    this.y += map(this.r, this.startR, 0, this.maxSpeed, 0);
    this.x += random(-0.5, 0.5);
    this.r -= 0.05;
  }
  
  draw() {
    let a = map(this.r, this.startR, 0, 255, 0);
    fill(230,50,50,a);
    circle(this.x, this.y, this.r * 2);
  }
}