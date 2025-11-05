let slimer;

function preload(){
  slimer = loadImage("Slimer.png")
print (slimer)
}



function setup() {
createCanvas(windowWidth, windowHeight);
imageMode(CENTER)
}

function draw() {
  background(220);

image(slimer, mouseX, mouseY,slimer.width,slimer.height)
}
