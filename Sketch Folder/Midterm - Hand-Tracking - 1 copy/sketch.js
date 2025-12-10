let xLoc = [];
let yLoc = [];
let decay = [];
let numSegments = 200;

let col1, col2;

// Hand tracking
let handPose, video;
let hands = [];

let hasEverHadHand = false;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  for (let i = 0; i < numSegments; i++) {
    xLoc[i] = width / 2;
    yLoc[i] = height / 2;
    decay[i] = 1;   // each segment starts fully visible
  }

  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(0);

  let handDetected = false;
  let targetX, targetY;

  // -----------------------------------------------
  // HAND DETECTED → update trail normally
  // -----------------------------------------------
  if (hands.length > 0) {
    let hand = hands[0];
    let indexTip = hand.keypoints.find(k =>
      k.name === "index_finger_tip" || k.part === "index_finger_tip"
    );

    if (!indexTip && hand.keypoints.length > 8) {
      indexTip = hand.keypoints[8];
    }

    if (indexTip) {
      handDetected = true;
      hasEverHadHand = true;

      targetX = indexTip.x;
      targetY = indexTip.y;

      // Reset all decays when hand is present
      for (let i = 0; i < numSegments; i++) {
        decay[i] = 1;
      }

      // Move tail → head
      xLoc[numSegments - 1] = targetX;
      yLoc[numSegments - 1] = targetY;

      for (let i = 0; i < numSegments - 1; i++) {
        xLoc[i] = xLoc[i + 1];
        yLoc[i] = yLoc[i + 1];
      }
    }
  }

  // -----------------------------------------------
  // NO HAND EVER? → draw nothing until first detection
  // -----------------------------------------------
  if (!hasEverHadHand) return;

  // -----------------------------------------------
  // NO HAND NOW → tail-first sine-based decay
  // -----------------------------------------------
  if (!handDetected) {
    for (let i = 0; i < numSegments; i++) {
      // 0..1 along chain
      let t = i / (numSegments - 1);

      // decay factor: sin curve (0 at tail → 1 at head)
      let fadeFactor = sin(t * HALF_PI);

      // gradually reduce decay
      decay[i] *= fadeFactor * 0.95;   // 0.95 smooths it nicely

      if (decay[i] < 0.001) decay[i] = 0; // clamp tiny values
    }
  }

  // -----------------------------------------------
  // DRAW TRAIL
  // -----------------------------------------------
  noFill();
  strokeWeight(2);

  for (let i = 0; i < numSegments; i++) {
    let t = i / (numSegments - 1);
    let s = sin(t * PI); // original shape profile
    let decayScale = decay[i];
    let d = 200 * s * decayScale;

    if (d <= 0.5) continue;

    let col = lerpColor(col1, col2, s);
    stroke(col);

    rect(xLoc[i], yLoc[i], d, d);
  }
}

function mousePressed() {
  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}