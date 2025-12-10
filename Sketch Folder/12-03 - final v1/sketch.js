let mic;
let faces = [];
let bgColor;

// =========================
//   FACE CLASS
// =========================
class Face {
  constructor(baseHue, s, b, mic) {
    this.mic = mic;

    this.offset = 5;
    this.mouthH = 101;

    // colors for THIS face
    this.c1 = color(baseHue, s, b);
    this.c2 = color((baseHue + 120) % 360, s, b);
    this.c3 = color((baseHue + 240) % 360, s, b);

    // blink stuff for THIS face
    this.eyeOpenAmount = 1.0;
    this.blinkStart = 0;
    this.blinkDuration = 200;
    this.nextBlink = random(1000, 3000);
  }

  updateBlink() {
    let now = millis();

    if (now > this.nextBlink) {
      this.blinkStart = now;
      this.nextBlink = now + random(2000, 5000);
    }

    let t = (now - this.blinkStart) / this.blinkDuration;

    if (t < 1) {
      this.eyeOpenAmount = 1 - t;
    } else if (t < 2) {
      this.eyeOpenAmount = t - 1;
    } else {
      this.eyeOpenAmount = 1;
    }

    this.eyeOpenAmount = constrain(this.eyeOpenAmount, 0, 1);
  }

  // draw ONE face in a cell centered at (cx, cy) with size (cellW, cellH)
  drawFace(cx, cy, cellW, cellH) {
    this.updateBlink();

    // ==== EYES ====
    let eyeW = 50;
    let eyeH = 50 * this.eyeOpenAmount;
    let offset = this.offset;

    noStroke();

    // positions copied from your single-face sketch, but
    // now relative to this cell instead of whole window
    let leftEyeX  = cx - cellW / 5;
    let leftEyeY  = cy - cellH / 5.5;
    let rightEyeX = cx + cellW / 5;
    let rightEyeY = cy - cellH / 8;

    // Left eye
    fill(this.c3);
    ellipse(leftEyeX, leftEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(leftEyeX - offset,
            leftEyeY - offset,
            eyeW, eyeH);

    // Right eye
    fill(this.c3);
    ellipse(rightEyeX, rightEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(rightEyeX - offset,
            rightEyeY - offset,
            eyeW, eyeH);

    // ==== MOUTH ====
    fill(this.c3);
    noStroke();

    let level = this.mic.getLevel();
    let minMouthHeight = cellH / 30;
    let maxMouthHeight = cellH / 6;

    let targetMouthH = map(level, 0, 0.03, minMouthHeight, maxMouthHeight, true);
    this.mouthH = lerp(this.mouthH, targetMouthH, 0.4);

    rect(cx, cy, cellW / 4, this.mouthH);
    fill(this.c1);
    rect(cx - offset,
         cy - offset,
         (cellW / 4) - offset,
         this.mouthH - offset);
  }
}

// =========================
//   P5 SETUP / DRAW
// =========================
function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100);

  mic = new p5.AudioIn();

  // create 6 faces with different palettes
  for (let i = 0; i < 6; i++) {
    let baseHue = random(0, 360);
    let s = 80;
    let b = 95;
    let f = new Face(baseHue, s, b, mic);
    faces.push(f);
    if (i === 0) bgColor = f.c2; // use first face's background as global bg
  }
}

function draw() {
  background(bgColor);

  let cols = 3;
  let rows = 2;
  let cellW = width / cols;
  let cellH = height / rows;
  let idx = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let cx = c * cellW + cellW / 2;
      let cy = r * cellH + cellH / 2;
      fill(faces[idx].c2)
      rect(cx, cy, cellW, cellH)
    

      faces[idx].drawFace(cx, cy, cellW, cellH);
      idx++;
    }
  }
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}