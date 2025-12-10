let balls = [];

let dragStartX = 0;
let dragStartY = 0;
let dragStartTime = 0;

let sound;
let playbackSpeed = 10;
let delay;

let currentRate = 10;        // smoothed playback rate
let lastBallsSeenTime = 1;  // last time we had at least one ball
const NO_BALLS_TIMEOUT = 50; // ms before stopping sound

const SPEED_SCALE = 0.01;
const GRAVITY = 0.2;

class Ball {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.d = random(30, 75);

    this.vx = vx;
    this.vy = vy;

    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
  }
  
  update() {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;
  }

  show() {
    fill(this.r, this.g, this.b);
    noStroke();
    circle(this.x, this.y, this.d);
  }
}

function preload() {
  sound = loadSound("overdrone.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  delay = new p5.Delay();
  delay.process(sound, 0.1, 0.6, 1000);
}

function draw() {
  background(255, 50);

  for (let b of balls) {
    b.update();
    b.show();
  }

  // Clean up: keep only balls that are near screen
  balls = balls.filter(b => isBallOnScreen(b, 300));

  if (balls.length > 0) {
    // remember last time we had balls
    lastBallsSeenTime = millis();
    updateSoundFromBalls();
  } else {
    // no balls: see if enough time has passed to stop sound
    if (sound.isPlaying() && millis() - lastBallsSeenTime > NO_BALLS_TIMEOUT) {
      sound.stop();
    }
  }
}

function updateSoundFromBalls() {
  if (!sound.isPlaying()) return;

  // Use average position of all balls for smoother control
  let sumX = 0;
  let sumY = 0;
  for (let b of balls) {
    sumX += b.x;
    sumY += b.y;
  }
  let avgX = constrain(sumX / balls.length, 0, width);
  let avgY = constrain(sumY / balls.length, 0, height);

  // Map X to playback speed in a *nice* range
  let targetRate = map(avgX, 0, width, 0.5, 2.0); // no negatives, no zero
  // Smooth the rate change
  currentRate = lerp(currentRate, targetRate, 0.1);
  sound.rate(currentRate);

  // Map Y to delay params
  let delayTime = map(avgY, 0, height, 0.05, 0.5);
  let feedback  = map(avgY, 0, height, 0.8, 0.2);
  delay.delayTime(delayTime);
  delay.feedback(feedback);
}

// Check if a ball is on or near the screen
function isBallOnScreen(b, padding = 0) {
  return (
    b.x + b.d / 2 > -padding &&
    b.x - b.d / 2 < width + padding &&
    b.y + b.d / 2 > -padding &&
    b.y - b.d / 2 < height + padding
  );
}

function mousePressed() {
  dragStartX = mouseX;
  dragStartY = mouseY;
  dragStartTime = millis();

  // Required in some browsers
  userStartAudio();

  // Start the sound if it's not already playing
  if (!sound.isPlaying()) {
    sound.loop();
    lastBallsSeenTime = millis();
  }
}

function mouseReleased() {
  let dragEndX = mouseX;
  let dragEndY = mouseY;
  let dragEndTime = millis();

  let dt = max((dragEndTime - dragStartTime) / 1000, 0.001);

  let dx = dragEndX - dragStartX;
  let dy = dragEndY - dragStartY;

  let vx = (dx / dt) * SPEED_SCALE;
  let vy = (dy / dt) * SPEED_SCALE;

  balls.push(new Ball(dragStartX, dragStartY, vx, vy));
}