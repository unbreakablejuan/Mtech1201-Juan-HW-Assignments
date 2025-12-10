let balls = [];
let MAX_BALLS = 200;  // max we will ever create

let point1 = null;
let point2 = null;

let slider, slider2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Gravity slider: min, max, initial, step
  slider = createSlider(0, 0.5, 0.02, 0.001);
  slider.position(((windowWidth/2)-100), 10);
  slider.size(120);

  // Number-of-balls slider: from 1 to MAX_BALLS
  slider2 = createSlider(1, MAX_BALLS, 50, 1);
  slider2.position(((windowWidth/2)+100), 10);
  slider2.size(120);

  // Pre-create a bunch of balls
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

function draw() {
  background(0, 100);

  let g = slider.value();
  let numBalls = floor(slider2.value());

  // draw the line if defined
  if (point1 && point2) {
    stroke(255);
    strokeWeight(3);
    line(point1.x, point1.y, point2.x, point2.y);
  }

  noStroke();

  for (let i = 0; i < numBalls; i++) {
    let b = balls[i];

    fill(b.col);
    circle(b.x, b.y, b.size);

    let radius = b.size / 2;

    if (b.mode === "falling") {
      b.vy += g;
      b.x += b.vx;
      b.y += b.vy;

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
            let normal = p5.Vector.sub(P, closest);
            if (normal.mag() === 0) {
              normal = createVector(0, -1);
            } else {
              normal.normalize();
            }
            b.x = closest.x + normal.x * radius;
            b.y = closest.y + normal.y * radius;

            let s = AB.copy().normalize();
            if (s.y < 0) s.mult(-1);

            let v = createVector(b.vx, b.vy);
            b.vAlong = v.dot(s);

            b.mode = "rolling";
          }
        }
      }

    } else if (b.mode === "rolling" && point1 && point2) {
      let A = createVector(point1.x, point1.y);
      let B = createVector(point2.x, point2.y);
      let AB = p5.Vector.sub(B, A);
      let s = AB.copy().normalize();
      if (s.y < 0) s.mult(-1);

      let aAlong = g * s.y;
      b.vAlong += aAlong;

      b.vx = s.x * b.vAlong;
      b.vy = s.y * b.vAlong;

      b.x += b.vx;
      b.y += b.vy;

      let P = createVector(b.x, b.y);
      let AP = p5.Vector.sub(P, A);
      let t = AB.magSq() > 0 ? AP.dot(AB) / AB.magSq() : 0;

      if (t < 0 || t > 1) {
        b.mode = "falling";
      }
    }

    if (b.y > height + b.size * 2) {
      resetBall(b);
    }
  }

  // HUD bar
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

function mouseClicked() {
  // Ignore clicks in the top UI bar (where sliders + HUD are)
  if (mouseY < 60) {
    return;
  }

  // Only handle line creation for clicks below the HUD
  if (!point1) {
    point1 = { x: mouseX, y: mouseY };
  } else if (!point2) {
    point2 = { x: mouseX, y: mouseY };
  } else {
    point1 = { x: mouseX, y: mouseY };
    point2 = null;
  }
}