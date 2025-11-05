let swidth = 5;

function setup(){
  createCanvas(windowWidth,windowHeight)
  background(255,180,60)
  textSize(24)
  text('Use UP/DOWN Arrow to CNTRL Stroke Weight', 50, 50,)
print (swidth)
}

function draw(){
  strokeWeight(swidth);
  stroke(0);

  if (mouseIsPressed){
    line(pmouseX, pmouseY, mouseX, mouseY)

  }
  

}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    swidth += 1;
  } else if (keyCode === DOWN_ARROW) {
    swidth = max(1, swidth - 1);
  }
}
