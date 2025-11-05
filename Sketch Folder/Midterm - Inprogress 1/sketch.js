let slimer;
let hallway;
//let x = 400;
//let xV = 4;
//let y += yV
let diameter = 150;
let count = 0;
let x = 0;
let y = 0;
let difficulty = 0;

let newX=0, newY=0;

function preload() {
  slimer = loadImage("slimer.png");
  hallway = loadImage("hotelhallway.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);
  setInterval(newPoint, 500);
  //image(hallway)
}

function draw() {
  //background(30, 40, 80);
  image(hallway,width/2, height/2, width, height)
  image(slimer,x,y, 150, 150);
  
  //move to random
  x = lerp(x, newX, 0.05);
  y = lerp(y, newY, 0.05);
  //x += xV;
  //y += yV;
  // Bounce off edges
  //if (x > width - diameter / 2 || x < diameter / 2) {
  //xV = -xV;
  
   // Player Mouse
  noFill();
  stroke(255);
  ellipse(mouseX, mouseY, 200,200)
  noFill
  strokeWeight(20)
  fill
  line(mouseX-65, mouseY-65, mouseX+65, mouseY+65 )
  
  // Detect catch
 let d = dist(mouseX, mouseY, x, y);
  if (d < 200 ) {
    count++;
     //teleport ghost randomly when caught
    //x = random(diameter / 2, width - diameter / 2);
  }

  
  // Display score
  noStroke();
  fill(255, 255, 0);
  text("Score: " + count, width / 2, height - 50);
  text("Difficulty: " + difficulty, width/2, height - 75)
}
function newPoint(){
  newX = random(width)
  newY = random(height)
  print('newpoint')
}
