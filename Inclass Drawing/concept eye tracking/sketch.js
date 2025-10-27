let pupilPosX = 400;
let pupilPosY = 400;

// Hand tracking
let handPose, video;
let hands = [];
let handX = null, handY = null; // fingertip position (mirrored)
const SMOOTH = 0.25;            // lerp factor for stable motion

function setup() {
  createCanvas(800, 800);
  background(33, 91, 18);

  // Webcam for handPose
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // we’re not drawing the video

  // Load model & start detection
  handPose = ml5.handPose();
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;

  if (hands.length > 0 && hands[0].keypoints && hands[0].keypoints.length > 8) {
    // Index fingertip is keypoint 8
    const tip = hands[0].keypoints[8];

    // Mirror X so it feels natural (like a mirror)
    const mirroredX = map(tip.x, 0, video.width, width, 0);
    const mappedY   = map(tip.y, 0, video.height, 0, height);

    // Smooth hand coords to reduce jitter
    if (handX == null) {
      handX = mirroredX;
      handY = mappedY;
    } else {
      handX = lerp(handX, mirroredX, SMOOTH);
      handY = lerp(handY, mappedY, SMOOTH);
    }
  } else {
    // No hand detected this frame
    handX = null;
    handY = null;
  }
}

function draw() {
  background(33, 91, 18);

  // Eyeball
  fill(255);
  noStroke();
  ellipse(400, 400, 500, 400);

  // Choose target: hand if present, else mouse
  const targetX = handX ?? mouseX;
  const targetY = handY ?? mouseY;

  // Vector from center to target
  let dx = targetX - 400;
  let dy = targetY - 400;

  // Keep pupil inside the eye
  const maxDist = 160; // travel radius from center
  const d = Math.hypot(dx, dy);
  if (d > maxDist) {
    dx = (dx / d) * maxDist;
    dy = (dy / d) * maxDist;
  }

  pupilPosX = 400 + dx;
  pupilPosY = 400 + dy;

  // Pupil
  fill(0);
  noStroke();
  circle(pupilPosX, pupilPosY, 60);

  // Optional debug reticle when hand is used
  if (handX !== null) {
    noFill();
    stroke(255);
    circle(targetX, targetY, 20);
  }
}