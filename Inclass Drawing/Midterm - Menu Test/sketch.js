let slimer, hallway;
let diameter = 150;
let count = 0;
let x = 0,
  y = 0;
let difficulty = 0;
let easy = 0.009,
  medium = 0.05,
  hard = 0.09;
let newX = 0,
  newY = 0;

// === Hand tracking variables ===1
let handPose, video;
let hands = [];
let handX = 0,
  handY = 0; // replacement for mouseX/mouseY

function preload() {
  slimer = loadImage("slimer.png");
  hallway = loadImage("hotelhallway.png");

  // Load ml5 handPose model
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
  setInterval(newPoint, 500);
}

function draw() {
  image(hallway, width / 2, height / 2, width, height);

  // If a hand is detected, use its index finger tip
  if (hands.length > 0) {
    let hand = hands[0];
    // keypoint[8] is index finger tip
    let indexTip = hand.keypoints[8];
    handX = map(indexTip.x, 0, video.width, width, 0); // mirror horizontally
    handY = map(indexTip.y, 0, video.height, 0, height);
  }

  // Draw Slimer
  //image(slimer, x, y, diameter, diameter);
  image(slimer, x, y, diameter, diameter);

  let speed;
  if (difficulty === "Easy") {
    speed = easy;
  } else if (difficulty === "Medium") {
    speed = medium;
  } else if (difficulty === "Hard") {
    speed = hard;
  } else {
    speed = medium; // default
  }
  x = lerp(x, newX, speed);
  y = lerp(y, newY, speed);

  // Cursor ring using hand position
  noFill();
  stroke(255);
  strokeWeight(2);
  ellipse(handX, handY, 200, 200);
  line(handX - 65, handY - 65, handX + 65, handY + 65);

  // Detect catch
  let d = dist(handX, handY, x, y);
  if (d < 100) {
    count++;
    //newPoint();
  }

  // Display score
  noStroke();
  fill(255, 255, 0);
  text("Score: " + count, width / 2, height - 50);
  text("Difficulty: " + difficulty, width / 2, height - 75);
  text("Press 1=Easy, 2=Medium, 3=Hard", width / 2, height - 100);
}

function newPoint() {
  newX = random(width);
  newY = random(height);
}

// Handle difficulty keys
function keyPressed() {
  if (key === "1") difficulty = "Easy";
  if (key === "2") difficulty = "Medium";
  if (key === "3") difficulty = "Hard";
}

// Hand tracking callback
function gotHands(results) {
  hands = results;
}
