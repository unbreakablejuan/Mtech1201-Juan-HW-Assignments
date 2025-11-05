let swidth = 5;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255, 180, 60);
}

function draw() {
  strokeWeight(swidth);
  let r = noise(t) * 255;
  let g = noise(t + 5) * 255;
  let b = noise(t + 10) * 255;
  stroke(r, g, b);
  //stroke(random(0, 255), random(0, 255), random(0, 255));

  if (mouseIsPressed) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }

  
  noStroke();
  fill(0);
  textSize(24);
  text('Use UP/DOWN Arrows to Control Stroke Weight', 50, 50);
  text('Press "C" to Clear Canvas', 50, 80);

  t += 0.01;
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    swidth += 1;
  } else if (keyCode === DOWN_ARROW) {
    swidth = max(1, swidth - 1);
  } else if (key === 'c' || key === 'C') {
    background(255, 180, 60);
  }
}