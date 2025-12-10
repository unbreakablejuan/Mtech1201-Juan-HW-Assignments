let squares = [];   // array to hold all squares
let spawnRate = 25; // new square every N frames
let growthRate = 10; // how fast each square grows

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noFill();
  stroke(250, 199, 69);
  strokeWeight(5);
}

function draw() {
  background(0, 122, 120);

  // create new squares over time
  if (frameCount % (6*spawnRate) === 0) { // #  * Spanrate effect the rate of new square generation
    squares.push({
      x: random(width),
      y: random(height),
      size: 20,
    });
  }

  // update and draw all squares
  for (let i = squares.length - 1; i >= 0; i--) {
    let s = squares[i];
    s.size += growthRate; // make it grow

    rect(windowWidth/2,windowHeight/2, s.size/16, s.size/4);

    rect(windowWidth/2,windowHeight/2, s.size/4, s.size/16);

    // remove if it's too big
    if (s.size > width*16) {
      squares.splice(i, 1);
    }
  }


  
}