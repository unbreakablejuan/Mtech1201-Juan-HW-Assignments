let balls = [];
let MAX_BALLS = 100;  // max we will ever create

let point1 = null;
let point2 = null;

let slider, slider2;

let handPose, video;
let hands = [];

function preload() {
  handPose = ml5.handPose();  // load the model
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Start webcam
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // Gravity slider
  slider = createSlider(0, 0.5, 0.05, 0.001);
  slider.position(((windowWidth/2)-100), 10);
  slider.size(120);

  // Number-of-balls slider
  slider2 = createSlider(1, MAX_BALLS, 50, 1);
  slider2.position(((windowWidth/2)+100), 10);
  slider2.size(120);

  // Pre-create balls
  for (let i = 0; i < MAX_BALLS; i++) {
    balls.push({
      x: random(0, width),
      y: random(-500, 0),
      vx: 0,
      vy: random(2, 5),
      size: random(20, 40),
      col: color(random(255), random(255), random(255)),
      mode: "falling",   // "falling" or "rolling"
      vAlong: 0          // speed along slope when rolling
    });
  }
}

// ml5 callback
function gotHands(results) {
  hands = results;
}

function draw() {
  background(0, 100);

  let g = slider.value();
  let numBalls = floor(slider2.value());

  // ====== USE HANDS TO DEFINE THE RAMP LINE ======
  point1 = null;
  point2 = null;

  if (hands.length >= 2) {
    function getFingerTip(hand) {
      if (!hand.keypoints || hand.keypoints.length === 0) return null;
      let tip = hand.keypoints.find(kp => kp.name === 'index_finger_tip');
      if (!tip) tip = hand.keypoints[0];
      return tip;
    }

    let tip1 = getFingerTip(hands[0]);
    let tip2 = getFingerTip(hands[1]);

    if (tip1 && tip2) {
      // map from video coords to canvas coords
      let sx = width / video.width;
      let sy = height / video.height;

      let x1 = tip1.x * sx;
      let y1 = tip1.y * sy;
      let x2 = tip2.x * sx;
      let y2 = tip2.y * sy;

      // MIRROR horizontally so the motion matches the user
      x1 = width - x1;
      x2 = width - x2;

      point1 = { x: x1, y: y1 };
      point2 = { x: x2, y: y2 };
    }
  }

  // Draw line if both endpoints exist
  if (point1 && point2) {
    stroke(255);
    strokeWeight(3);
    line(point1.x, point1.y, point2.x, point2.y);
  }

  noStroke();

  // ====== BALL PHYSICS ======
  for (let i = 0; i < numBalls; i++) {
    let b = balls[i];

    fill(b.col);
    circle(b.x, b.y, b.size);

    let radius = b.size / 2;

    if (b.mode === "falling") {
      // gravity straight down
      b.vy += g;
      b.x += b.vx;
      b.y += b.vy;

      // collision with line → switch to rolling
      if (point1 && point2) {
        let A = createVector(point1.x, point1.y);
        let B = createVector(point2.x, point2.y);
        let P = createVector(b.x, b.y);

        let AB = p5.Vector.sub(B, A);
        let AP = p5.Vector.sub(P, A);

        let ab2 = AB.magSq();
        if (ab2 > 0) {
          let t = constrain(AP.dot(AB) / ab2, 0, 1);
          let closest = p5.Vector.add(A, p5.Vector.mult(AB, t));
          let distToLine = p5.Vector.dist(P, closest);

          if (distToLine <= radius) {
            // push ball out of the line
            let normal = p5.Vector.sub(P, closest);
            if (normal.mag() === 0) {
              normal = createVector(0, -1);
            } else {
              normal.normalize();
            }
            b.x = closest.x + normal.x * radius;
            b.y = closest.y + normal.y * radius;

            // slope direction (unit vector)
            let s = AB.copy().normalize();
            if (s.y < 0) s.mult(-1); // downhill

            // current velocity as vector
            let v = createVector(b.vx, b.vy);
            b.vAlong = v.dot(s);   // speed along slope

            b.mode = "rolling";
          }
        }
      }

    } else if (b.mode === "rolling" && point1 && point2) {
      let A = createVector(point1.x, point1.y);
      let B = createVector(point2.x, point2.y);
      let AB = p5.Vector.sub(B, A);
      let s = AB.copy().normalize();
      if (s.y < 0) s.mult(-1); // downhill

      // physics: a_along = g * sin(theta) = g * s.y
      let aAlong = g * s.y;

      // update slope speed
      b.vAlong += aAlong;

      // convert to vx, vy
      b.vx = s.x * b.vAlong;
      b.vy = s.y * b.vAlong;

      // move
      b.x += b.vx;
      b.y += b.vy;

      // how far along segment are we?
      let P = createVector(b.x, b.y);
      let AP = p5.Vector.sub(P, A);
      let t = AB.magSq() > 0 ? AP.dot(AB) / AB.magSq() : 0;

      // if rolled past end → fall with current velocity
      if (t < 0 || t > 1) {
        b.mode = "falling";
      }
    }

    // reset if way off screen
    if (b.y > height + b.size * 2) {
      resetBall(b);
    }
  }

  // HUD bar on top
  fill(255);
  rect(0, 0, width, 60);

  noStroke();
  fill(0);
  textSize(14);
  text('Gravity = ' + g.toFixed(3), ((windowWidth/2)-100), 45)
  text('# balls = ' + numBalls, ((windowWidth/2)+100), 45);
}

function resetBall(b) {
  b.x = random(width);
  b.y = random(-200, 0);
  b.vx = 0;
  b.vy = random(2, 5);
  b.col = color(random(255), random(255), random(255));
  b.mode = "falling";
  b.vAlong = 0;
}