let xLoc = [];
let yLoc = [];
let numSegments = 200;

let col1, col2;
let count = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize all segments to the center
  for (let i = 0; i < numSegments; i++) {
    xLoc[i] = width / 2;
    yLoc[i] = height / 2;
  }

  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}

function draw() {
  background(0);
  rectMode(CENTER)

  // Set newest segment to mouse
  xLoc[numSegments - 1] = mouseX;
  yLoc[numSegments - 1] = mouseY;

  // Shift everything toward index 0 (avoid i = last index)
  for (let i = 0; i < numSegments - 1; i++) {
    xLoc[i] = xLoc[i + 1];
    yLoc[i] = yLoc[i + 1];
  }

  noFill();
  strokeWeight(2);

  for (let i = 0; i < numSegments; i++) {
    // 0 → 1 across the chain
    const t = i / (numSegments - 1);

    
    const s = sin(t * PI); // 0..1..0
    const diameter = 200 * s;
    const col = lerpColor(col1, col2, s);

    stroke(col);
    rect(xLoc[i], yLoc[i], diameter, diameter);
  }

  count += 0.05;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Optional: click to randomize colors
function mousePressed() {
  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}