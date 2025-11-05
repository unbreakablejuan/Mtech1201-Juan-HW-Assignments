let slimer;
let hallway;
let diameter = 150;
let count = 0;
let x = 0;
let y = 0;
let difficulty = 0;
let easy = 0.009
let medium = 0.05
let hard = 0.13

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
  
}

function draw() {
  //background(30, 40, 80); //sets a solid color
  image(hallway,width/2, height/2, width, height) //loads the image of hallway
  image(slimer,x,y, 150, 150);
  
  //move to random
  let speed;
if (difficulty === "Easy") {
  speed = easy;
} else if (difficulty === "Medium") {
  speed = medium;
} else if (difficulty === "Hard") {
  speed = hard;
} else {
  speed = medium; // default
}
  
  x = lerp(x, newX, speed);
  y = lerp(y, newY, speed);
 
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

function keyPressed() {
  if (key === '1') {
    difficulty = "Easy";
  } else if (key === '2') {
    difficulty = "Medium";
  } else if (key === '3') {
    difficulty = "Hard";
  }
}