function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0)

}

function draw() {


  
rectMode(CENTER)
 background(0) // REMOVE THIS TO MAKE TRAILS
  strokeWeight(2)
  stroke('yellow')

  rect(windowWidth/2, windowHeight/2, windowWidth,windowHeight)
  // rect(windowWidth/2, windowHeight/2, windowWidth/2,windowHeight/2)
  // rect(windowWidth/2, windowHeight/2, windowWidth/4,windowHeight/4)
  // rect(windowWidth/2, windowHeight/2, windowWidth/6,windowHeight/6)
  //  rect(windowWidth/2, windowHeight/2, windowWidth/8,windowHeight/8)  

   //rect(windowWidth/2, windowHeight/2, windowWidth/(mouseX/200),windowHeight) - interesting behavior
line(windowWidth/2,windowHeight/2,0,0)
line(windowWidth/2,windowHeight/2,windowWidth,0)
line (windowWidth/2, windowHeight/2,0, windowHeight)
line(windowWidth/2, windowHeight/2, windowWidth,windowHeight)

Push();
let scaleFactor = map(mouseY, 0, width, 0.5, 3); // Scale from 0.5 to 3

  // Translate to the desired center of the rectangle
  translate(width / 2, height / 2);

  // Apply the scaling
  scale(scaleFactor);

  // Draw the rectangle at (0,0) relative to the translated origin
  rect(0, 0, windowWidth/2, windowHeight/2);
  rect(0, 0, windowWidth/2,windowHeight/2)
  rect(0, 0, windowWidth/4,windowHeight/4)
  rect(0, 0, windowWidth/6,windowHeight/6)
  rect(0, 0, windowWidth/8,windowHeight/8)  
  pop();


print(windowHeight)
  
  fill(0,0,0)
  
  strokeWeight(8)
  stroke('red')
  
  //let i = abs(mouseX-width/2)  //red lines
  //let x1=map(i,0,width/2, width/2-25,50)

  //line(x1,0,x1,windowHeight)
  //line(width-x1,0,width-x1,windowHeight)
  

}

