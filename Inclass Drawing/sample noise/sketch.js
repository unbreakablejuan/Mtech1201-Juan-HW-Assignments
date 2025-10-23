let t = 0;

function setup() {
  createCanvas(400, 200);
  noStroke();
}

function draw() {
  background(255);

  // RANDOM line
  fill(255, 0, 0);
  let r = random(height);
  ellipse(frameCount, r, 3, 3);

  // NOISE line
  fill(0, 0, 255);
  let n = noise(t) * height;
  ellipse(frameCount, n, 3, 3);

  t += 0.01;
}
