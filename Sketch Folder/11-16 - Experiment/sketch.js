let vertPos1;
let vertPos2;
let horPos1, horPos2;
let col1, col2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  col1 = color(255, 0, 0); // correct!
  col2 = color(0, 255, 0); // correct!

  vertPos1 = floor(random(0, windowWidth));
  vertPos2 = floor(random(0, windowWidth));
  
  horPos1 = 0;
  horPos2 = 0;
}

function draw() {
  background(0, 100);

  fill(col1);
  circle(vertPos1, horPos1, 50);
  
  fill(col2); 
  circle(vertPos2, horPos2, 50);

  horPos1 += random(1, 10);
  horPos2 += random(1, 5);

  if (horPos1 > windowHeight) {
    horPos1 = 0;
    vertPos1 = floor(random(0, windowWidth));
    col1 = color(random(255),random(255),random(255))
  }

  if (horPos2 > windowHeight) {
    horPos2 = 0;
    vertPos2 = floor(random(0, windowWidth));
    col2 = color(random(255),random(255),random(255))
  }
}