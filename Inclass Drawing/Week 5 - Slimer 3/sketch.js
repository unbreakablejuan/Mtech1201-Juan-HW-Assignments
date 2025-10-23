

let slimer;

function preload(){
  slimer = loadImage("slimer.png")

  angleMode(DEGREES)
  
}

function setup(){
  createCanvas(windowWidth,windowHeight);
  imageMode(CENTER);
  noFill()
  stroke(255)
}


function draw(){
 background(50)
 noFill()

let x = width * noise(frameCount* 0.01)
let y = height * noise(frameCount*0.01 +10)
let r = 360* noise(frameCount*0.01,frameCount*0.01 +10  )

if(dist(x,y, mouseX, mouseY) < 100){
  
    background(255,100,0)
    textSize(72)
    //fill(255,100,0)
    text("You got him", width/2, height/2)
 }




 push()
 translate(x, y)
 rotate(r/16)
 image(slimer,0 ,0 ,100,100)
 pop()

 
ellipse(mouseX, mouseY, 200,200)
noFill
strokeWeight(20)
fill
line(mouseX-65, mouseY-65, mouseX+65, mouseY+65 )


  

}

