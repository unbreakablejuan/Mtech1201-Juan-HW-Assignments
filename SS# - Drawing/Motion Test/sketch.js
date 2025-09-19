function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0)

}


function draw() {
  background(0);
  stroke('yellow');
  strokeWeight(2);
  rectMode(CENTER);

  // draw lines 
  line(width/2, height/2, 0, 0);
  line(width/2, height/2, width, 0);
  line(width/2, height/2, 0, height);
  line(width/2, height/2, width, height);

  // Scaling Rectangles
  push();
  const scaleFactor = map(mouseY, 0, height, 0.5, 3);
  translate(width/2, height/2);
  scale(scaleFactor);

  // draw your concentric rects centered at (0,0)
  noFill();
  rect(0, 0, width, height);
  rect(0, 0, width/2, height/2);
  rect(0, 0, width/3, height/3);
  rect(0, 0, width/4, height/4);
  rect(0, 0, width/6, height/6);
  rect(0, 0, width/8, height/8)
  fill(0)
  rect(0, 0, width/8, height/8)
  pop();

  strokeWeight(8)
  stroke('red')
  
  let i = abs(mouseX-width/2)  //red lines
  let x1=map(i,0,width/2, width/2-25,50)

  line(x1,0,x1,windowHeight)
  line(width-x1,0,width-x1,windowHeight)
  

}
