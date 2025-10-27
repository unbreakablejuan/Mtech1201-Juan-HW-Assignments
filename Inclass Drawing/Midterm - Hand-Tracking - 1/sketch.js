// === Game variables ===
let slimer, hallway;
let diameter = 150;
let count = 0;

// Slimer position & target
let x, y;
let newX, newY;
let targetMargin = 80;

// Difficulty (lerp speed)
const EASY = 0.003, MEDIUM = 0.025, HARD = 0.07;
let speed = MEDIUM;
let difficulty = "Medium";

// Scoring debounce
let wasOnSlimer = false;

// === Hand tracking variables ===
let handPose, video;
let hands = [];
let handX = 0, handY = 0;  // replacement for mouseX/mouseY

function preload() {
  slimer = loadImage("slimer.png");
  hallway = loadImage("hotelhallway.png");
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);

  // Start video feed
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // Start Slimer on screen and pick a first target
  x = random(targetMargin, width - targetMargin);
  y = random(targetMargin, height - targetMargin);
  newPoint();
}

function draw() {
  // Background
  image(hallway, width / 2, height / 2, width, height);

  // Use index fingertip if present; else fall back to mouse
  if (hands.length > 0 && hands[0]?.keypoints?.[8]) {
    const tip = hands[0].keypoints[8];
    handX = map(tip.x, 0, video.width, width, 0); // mirror horizontally
    handY = map(tip.y, 0, video.height, 0, height);
  } else {
    handX = mouseX;
    handY = mouseY;
  }

  // --- Slimer motion with lerp ---
  x = lerp(x, newX, speed);
  y = lerp(y, newY, speed);

  // Retarget when close to destination
  if (dist(x, y, newX, newY) < 10) {
    newPoint();
  }

  // Draw Slimer
  image(slimer, x, y, diameter, diameter);

  // Cursor ring
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(handX, handY, 200, 200);
  line(handX - 65, handY - 65, handX + 65, handY + 65);

  // Detect catch (debounced so it increments once per “touch”)
  const onSlimer = dist(handX, handY, x, y) < 100;
  if (onSlimer && !wasOnSlimer) {
    count++;
    newPoint(); // keep it lively
  }
  wasOnSlimer = onSlimer;

  // HUD
  noStroke();
  fill(255, 255, 0);
  text("Score: " + count, width / 2, height - 50);
  text("Difficulty: " + difficulty, width / 2, height - 75);
  text("Press 1=Easy, 2=Medium, 3=Hard | R=Reset", width / 2, height - 100);
}

function newPoint() {
  newX = random(targetMargin, width - targetMargin);
  newY = random(targetMargin, height - targetMargin);
}

// Handle difficulty keys
function keyPressed() {
  if (key === '1') { speed = EASY;   difficulty = "Easy"; }
  if (key === '2') { speed = MEDIUM; difficulty = "Medium"; }
  if (key === '3') { speed = HARD;   difficulty = "Hard"; }
  if (key === 'r' || key === 'R') count = 0;
}

// Hand tracking callback
function gotHands(results) {
  hands = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // keep current target and position in bounds after resize
  x = constrain(x, targetMargin, width - targetMargin);
  y = constrain(y, targetMargin, height - targetMargin);
  newX = constrain(newX, targetMargin, width - targetMargin);
  newY = constrain(newY, targetMargin, width - targetMargin);
}