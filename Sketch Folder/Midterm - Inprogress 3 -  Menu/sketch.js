let slimer;
let hallway;

let diameter = 150;
let count = 0;

// Target (Slimer) current & next positions
let x = 0, y = 0;
let newX = 0, newY = 0;

// Difficulty
let difficulty = "Medium";
const EASY = 0.009;
const MEDIUM = 0.05;
const HARD = 0.13;

let funcSelect = 0; // 0 = menu / idle, 1 = game scene, 2 = alt scene
let button1, button2;

let caughtCooldown = false; // prevent scoring every frame while overlapped

function preload() {
  slimer = loadImage("slimer.png");
  hallway = loadImage("hotelhallway.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);

  // Start at center; pick a first target
  x = width / 2;
  y = height / 2;
  newPoint(); // set initial newX/newY

  // Move target periodically
  setInterval(newPoint, 500);

  // UI buttons
  button1 = createButton("Start Game");
  button1.size(120, 36);
  button1.mousePressed(select1);

  button2 = createButton("Scene 2");
  button2.size(120, 36);
  button2.mousePressed(select2);

  positionButtons();
}

function draw() {
  background(0);

  switch (funcSelect) {
    case 0:
      // Idle/menu screen
      fill(255);
      noStroke();
      text("Press 1/2/3 to set difficulty • Click a button to start", width/2, height/2 - 60);
      text("1 = Easy   2 = Medium   3 = Hard", width/2, height/2 - 24);
      break;

    case 1:
      drawGameScene();
      break;

    case 2:
      drawAltScene();
      break;
  }
}

function drawGameScene() {
  // Background hallway
  image(hallway, width/2, height/2, width, height);

  // Determine speed by difficulty
  let speed = MEDIUM;
  if (difficulty === "Easy")  speed = EASY;
  if (difficulty === "Medium") speed = MEDIUM;
  if (difficulty === "Hard")  speed = HARD;

  // Ease Slimer toward new target
  x = lerp(x, newX, speed);
  y = lerp(y, newY, speed);

  // Draw Slimer
  image(slimer, x, y, diameter, diameter);

  // Player reticle
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(mouseX, mouseY, 200, 200);
  line(mouseX - 65, mouseY - 65, mouseX + 65, mouseY + 65);

  // Detect catch (one point per catch)
  const d = dist(mouseX, mouseY, x, y);
  const catchRadius = 100; // tighter than reticle for fairness
  if (d < catchRadius && !caughtCooldown) {
    count++;
    caughtCooldown = true;   // block repeated scoring
    newPoint();              // jump to a fresh target
  }
  if (d >= catchRadius) {
    // Once the player moves off the target, allow future scoring
    caughtCooldown = false;
  }

  // HUD
  noStroke();
  fill(255, 255, 0);
  text("Score: " + count, width / 2, height - 50);
  text("Difficulty: " + difficulty + "  (1/2/3 to change)", width / 2, height - 80);
}

function drawAltScene() {
  background(255);
  stroke(10);
  strokeWeight(20);
  line(40, 40, 140, 140);

  noStroke();
  fill(0);
  text("Scene 2 — demo", width/2, height/2);
}

function newPoint() {
  // Keep target well inside the screen so it’s not hugging edges
  const margin = 100;
  newX = random(margin, width - margin);
  newY = random(margin, height - margin);
}

function keyPressed() {
  if (key === '1') {
    difficulty = "Easy";
  } else if (key === '2') {
    difficulty = "Medium";
  } else if (key === '3') {
    difficulty = "Hard";
  }
}

function select1() {
  funcSelect = 1;
  count = 0;
}

function select2() {
  funcSelect = 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButtons();
}

function positionButtons() {
  // Place buttons side-by-side centered on screen
  const spacing = 20;
  const totalWidth = 120 * 2 + spacing;
  const startX = (windowWidth - totalWidth) / 2;
  const y = windowHeight / 2;

  button1.position(startX, y);
  button2.position(startX + 120 + spacing, y);
}