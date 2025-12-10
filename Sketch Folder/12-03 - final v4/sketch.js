let mic;
let fft;
let peakDetect;
let faces = [];
let bgColor;

let bassN = 0;
let midN = 0;
let trebleN = 0;

let bassGain = 0.4;
let midGain = 1.0;
let trebleGain = 2.0;

let bassSlider, midSlider, trebleSlider;
let showEQ = false;

let faceCol = 6;
let faceRow = 2
;

let autoPalette = false;  // peak detection default state/ false = no change, true = color changing

// =========================
//   FACE CLASS
// =========================
class Face {
  constructor(baseHue, s, b, bandName) {
    this.bandName = bandName;   // "bass", "mid", or "treble"

    this.offset = 5;
    this.mouthH = 200;

    this.intialEyeH = 50;
    this.intialEyeW = 50;

    this.leftEyeRan = random(4, 8);
    this.rightEyeRan = random(4, 8);
    this.mouthWidth = random(2, 5);
    this.mouthYloc = random(0, 200);

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
      this.eyeOpenAmount = 1 - t;   // closing
    } else if (t < 2) {
      this.eyeOpenAmount = t - 1;   // opening
    } else {
      this.eyeOpenAmount = 1;       // fully open
    }

    this.eyeOpenAmount = constrain(this.eyeOpenAmount, 0, 1);
  }

  getBandLevel() {
    if (this.bandName === "bass")   return bassN;
    if (this.bandName === "mid")    return midN;
    if (this.bandName === "treble") return trebleN;
    return 0;
  }

  drawFace(cx, cy, cellW, cellH) {
    this.updateBlink();

    // ==== EYES ====
    let eyeW = this.intialEyeW;
    let eyeH = this.intialEyeH * this.eyeOpenAmount;
    let offset = this.offset;

    noStroke();

    let leftEyeX  = cx - cellW / this.leftEyeRan;
    let leftEyeY  = cy - cellH / this.leftEyeRan;
    let rightEyeX = cx + cellW / this.rightEyeRan;
    let rightEyeY = cy - cellH / this.rightEyeRan;

    // Left eye
    fill(this.c3);
    ellipse(leftEyeX, leftEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(leftEyeX - offset, leftEyeY - offset, eyeW, eyeH);

    // Right eye
    fill(this.c3);
    ellipse(rightEyeX, rightEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(rightEyeX - offset, rightEyeY - offset, eyeW, eyeH);

    // ==== MOUTH ====
    fill(this.c3);
    noStroke();

    let bandVal = this.getBandLevel(); // 0–1
    // optional curve for more motion:
    let mouthLevel = pow(bandVal, 0.7);

    let minMouthHeight = cellH / 20;
    let maxMouthHeight = cellH / 3;

    let targetMouthH = map(mouthLevel, 0, 1, minMouthHeight, maxMouthHeight, true);
    this.mouthH = lerp(this.mouthH, targetMouthH, 1);

    rect(cx, cy + this.mouthYloc, cellW / this.mouthWidth, this.mouthH);
    fill(this.c1);
    rect(
      cx - offset,
      (cy + this.mouthYloc) - offset,
      (cellW / 4) - offset,
      this.mouthH - offset
    );
  }
}

// =========================
//   COLOR RANDOMIZE
// =========================
function randomizeColors() {
  for (let i = 0; i < faces.length; i++) {
    let baseHue = random(0, 360);
    let s = 80;
    let b = 95;
    faces[i].c1 = color(baseHue, s, b);
    faces[i].c2 = color((baseHue + 120) % 360, s, b);
    faces[i].c3 = color((baseHue + 240) % 360, s, b);
  }
  if (faces.length > 0) {
    bgColor = faces[0].c2;
  }
}

// one place to handle “W behavior”
function triggerPaletteChange() {
  randomizeColors();
}

// Map raw FFT energy (0–255) into a juicy 0–1 response
function bandResponse(energy, gain, floor, ceiling, curve = 0.6) {
  let norm = map(energy, floor, ceiling, 0, 1, true); // clamp 0–1
  norm = pow(norm, curve);   // curve response
  norm *= gain;              // apply sensitivity
  return constrain(norm, 0, 1);
}

// =========================
//   P5 SETUP / DRAW
// =========================
function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100);

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  // Peak detector tuned to low-ish (bass) for tempo-ish behavior
  peakDetect = new p5.PeakDetect(20, 200, 0.35, 20);

  let numFaces = faceCol * faceRow;
  for (let i = 0; i < numFaces; i++) {
    let col = i % 3;  // 0,1,2 repeating
    let bandName = (col === 0) ? "bass" :
                   (col === 1) ? "mid" : "treble";

    let baseHue = random(0, 360);
    let s = 80;
    let b = 95;
    let f = new Face(baseHue, s, b, bandName);
    faces.push(f);
    if (i === 0) bgColor = f.c2;
  }

  // Sliders for EQ
  bassSlider = createSlider(0, 3, bassGain, 0.01);
  midSlider = createSlider(0, 3, midGain, 0.01);
  trebleSlider = createSlider(0, 5, trebleGain, 0.01);

  bassSlider.position(20, 20);
  midSlider.position(20, 50);
  trebleSlider.position(20, 80);

  bassSlider.hide();
  midSlider.hide();
  trebleSlider.hide();
}

function draw() {
  background(bgColor);

  // === AUDIO / FFT ===
  if (mic && mic.enabled) {
    fft.analyze();
    peakDetect.update(fft);

    // Frequency ranges
    let bassRaw   = fft.getEnergy(20, 120);    // kick / low bass
    let midRaw    = fft.getEnergy(120, 2000);  // body, vocals, snares
    let trebleRaw = fft.getEnergy(2000, 8000); // hats / brightness

    bassGain   = bassSlider.value();
    midGain    = midSlider.value();
    trebleGain = trebleSlider.value();

    // floor, ceiling, curve tuned for more motion
    bassN   = bandResponse(bassRaw,   bassGain,   10, 140, 0.1);
    midN    = bandResponse(midRaw,    midGain,    5,  120, 0.6);
    trebleN = bandResponse(trebleRaw, trebleGain, 2,   80, 0.7);

    if (peakDetect.isDetected && autoPalette) {
      triggerPaletteChange();
    }
  } else {
    bassN = midN = trebleN = 0;
  }

  // === GRID OF FACES ===
  let cols = faceCol;
  let rows = faceRow;
  let cellW = width / cols;
  let cellH = height / rows;
  let idx = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let cx = c * cellW + cellW / 2;
      let cy = r * cellH + cellH / 2;

      fill(faces[idx].c2);
      noStroke();
      rect(cx, cy, cellW, cellH);

      faces[idx].drawFace(cx, cy, cellW, cellH);
      idx++;
    }
  }

  if (showEQ) {
    fill(0, 0, 100);
    noStroke();
    textSize(14);
    textAlign(LEFT, CENTER);

    text("Bass Gain",   bassSlider.x * 2 + bassSlider.width, 27);
    text("Mid Gain",    midSlider.x * 2 + midSlider.width, 57);
    text("Treble Gain", trebleSlider.x * 2 + trebleSlider.width, 87);
  }
}

// Start audio on interaction (required by browser)
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

function keyPressed() {
  if (key === 'q' || key === 'Q') {
    showEQ = !showEQ;
    if (showEQ) {
      bassSlider.show();
      midSlider.show();
      trebleSlider.show();
    } else {
      bassSlider.hide();
      midSlider.hide();
      trebleSlider.hide();
    }
  }

  if (key === 'w' || key === 'W') {
    // manual “tempo change”
    triggerPaletteChange();
  }

  if (key === 'e' || key === 'E') {
    // toggle auto palette change on peaks
    autoPalette = !autoPalette;
    // console.log("Auto palette:", autoPalette);
  }
}