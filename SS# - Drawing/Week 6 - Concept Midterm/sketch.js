let slimer;

//let xLoc, yLoc;

//let crossedObstacle = false;
//let pCrossedObstacle = false;
//let count = 0;
let x = 400;
let xV = 4;
let diameter = 300;

let count =0

function preload(){
  slimer = loadImage("slimer.png")
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
 

}

function draw(){
  background(255)
  fill(255,255,0)
  //circle(windowWidth/2, windowHeight/4,300)
  //circle(x, windowHeight/4,300);

 if(x > width - diameter/2){
  xV = -xV;
}
if (x < diameter/2){
  xV = -xV;
}

if(dist(mouseX, mouseY,x,windowHeight/4 < 50)){

  count++
}


print(count)

  circle(mouseX,mouseY,2)
  
  image(slimer, x, windowHeight/4);
  strokeWeight(5)
  stroke(255,180,60)

  line(0,windowHeight,mouseX, mouseY)

  x+= xV;

}