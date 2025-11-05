let slimer;
let x = 400;
let xV = 4;
//let y += yV
let diameter = 150;
let count = 0;

function preload() {
  slimer = loadImage("slimer.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {
  background(30, 40, 80);
  
 
  x += xV;
 //y += yV;
  
  // Bounce off edges
  if (x > width - diameter / 2 || x < diameter / 2) {
    xV = -xV;
  }
  
  image(slimer, x, height / 4, diameter, diameter);
  
  // Player Mouse
  noFill();
  stroke(255);
  ellipse(mouseX, mouseY, 200,200)
  noFill
  strokeWeight(20)
  fill
  line(mouseX-65, mouseY-65, mouseX+65, mouseY+65 )
  
  // Detect catch
  let d = dist(mouseX, mouseY, x, height / 4);
  if (d < diameter / 2) {
    count++;
    // teleport ghost randomly when caught
    x = random(diameter / 2, width - diameter / 2);
  }
  
  // Display score
  noStroke();
  fill(255, 255, 0);
  text("Ghosts caught: " + count, width / 2, height - 50);
}