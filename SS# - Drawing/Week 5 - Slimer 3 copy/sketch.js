

function setup(){
  createCanvas (windowWidth, windowHeight);
  
  rectMode(CENTER)
  


}


function draw(){

background(255, 230, 190)

stroke(255,0,0)
strokeWeight(60)
noFill()
line(windowHeight/2,windowWidth/2,mouseX,mouseY)

circle(windowHeight/2, windowWidth/2, 500)
 
fill(0);
textSize(16);
text("(" + mouseX + ", " + mouseY + ")", 20, 20);


}