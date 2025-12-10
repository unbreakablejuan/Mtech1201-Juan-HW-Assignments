let squares = [];   // array to hold all squares
let spawnRate = 25; // new square every N frames
let growthRate = 10; // how fast each square grows
let col1, col2

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noFill();

  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));

  
  strokeWeight(5);

  
}

function draw() {
  background(col2);
  stroke(col1);

  // angle from center of canvas to mouse
  let angle = atan2(mouseY - height / 2, mouseX - width / 2);

  // create new squares over time
  if (frameCount % (6 * spawnRate) === 0) {
    squares.push({
      size: 20,
    });
  }

  // update and draw all squares
  for (let i = squares.length - 1; i >= 0; i--) {
    let s = squares[i];
    s.size += growthRate; // make it grow

    // draw each shape centered on canvas, rotated toward mouse
    push();
    translate(width / 2, height / 2); // move origin to center
    rotate(angle);                    // rotate based on mouse position
    rect(0, 0, s.size / 4, s.size / 16);
    rect(0, 0, s.size / 16, s.size / 4);
    pop();

    // remove if it's too big
    if (s.size > width * 45) {
      squares.splice(i, 1);
    }
  }
}

function mousePressed() {
  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}