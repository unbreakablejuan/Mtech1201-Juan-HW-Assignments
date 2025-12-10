let mic;
let fft;
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

// =========================
//   FACE CLASS
// =========================
class Face {
  constructor(baseHue, s, b, bandName) {
    this.bandName = bandName;   // "bass", "mid", or "treble"

    this.offset = 5;
    this.mouthH = 200;
    // this.intialEyeH = random(-50,75)
    // this.intialEyeW = random(-10,10)

    this.intialEyeH = 50
    this.intialEyeW = 50

    this.leftEyeRan = random(4,8)
    this.rightEyeRan = random(4,8)
    this.mouthWidth = random(2,5)
    this.mouthYloc = random(0,75)

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

  getBandLevel() {
    // use global normalized band values
    if (this.bandName === "bass")   return bassN;
    if (this.bandName === "mid")    return midN;
    if (this.bandName === "treble") return trebleN;
    return 0;
  }

  // draw ONE face in a cell centered at (cx, cy) with size (cellW, cellH)
  drawFace(cx, cy, cellW, cellH) {
    this.updateBlink();

    // ==== EYES ====
    let eyeW = this.intialEyeW;
    let eyeH = this.intialEyeH * this.eyeOpenAmount;
    let offset = this.offset;

    noStroke();

    // let leftEyeX  = cx - cellW / 5 - (this.leftEyeRanr);
    // let leftEyeY  = cy - cellH / 5; - (this.leftEyeRan);
    // let rightEyeX = cx + cellW / 5; - this.rightEyeRan;
    // let rightEyeY = cy - cellH / 5; - this.rightEyeRan;


    let leftEyeX  = cx - cellW / this.leftEyeRan  //(this.leftEyeRanr);
    let leftEyeY  = cy - cellH / this.leftEyeRan;  //(this.leftEyeRan);
    let rightEyeX = cx + cellW / this.rightEyeRan;  //this.rightEyeRan;
    let rightEyeY = cy - cellH / this.rightEyeRan;  //this.rightEyeRan;

    // Left eye
    fill(this.c3);
    ellipse(leftEyeX, leftEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(leftEyeX - offset,
            leftEyeY - offset,
            eyeW, eyeH,1);

    // Right eye
    fill(this.c3);
    ellipse(rightEyeX, rightEyeY, eyeW, eyeH);
    fill(this.c1);
    ellipse(rightEyeX - offset, rightEyeY - offset,eyeW, eyeH);

    // Mouth
    fill(this.c3);
    noStroke();

    // use per-band energy instead of mic.getLevel()
    let bandVal = this.getBandLevel(); // 0–1

    let minMouthHeight = cellH / 20;
    let maxMouthHeight = cellH / 3;

    let targetMouthH = map(bandVal, 0, 1, minMouthHeight, maxMouthHeight, true);
    this.mouthH = lerp(this.mouthH, targetMouthH, 1);

    rect(cx, cy+ this.mouthYloc, cellW / this.mouthWidth, this.mouthH); // this drows the offset lower layer
    fill(this.c1);
    rect(cx - offset, (cy+ this.mouthYloc)- offset,(cellW / 4) - offset,this.mouthH - offset); // this draws the top
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
  // Use first face's c2 as background
  if (faces.length > 0) {
    bgColor = faces[0].c2;
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

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  // create 6 faces, mapping columns to bands:
  // col 0 (left) = bass, col 1 (middle) = mid, col 2 (right) = treble
  let numFaces = 6;
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

  // === Sliders for EQ gains (hidden by default) ===
  bassSlider = createSlider(0, 3, bassGain, 0.01);  // 0–3
  midSlider = createSlider(0, 3, midGain, 0.01);    // 0–3
  trebleSlider = createSlider(0, 5, trebleGain, 0.01); // 0–5

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
  if (mic.enabled) {
    fft.analyze();

    let bass   = fft.getEnergy("bass");   // 20–140 Hz
    let mid    = fft.getEnergy("mid");    // 140–4000 Hz
    let treble = fft.getEnergy("treble"); // 4000+ Hz

    // Get gain values from sliders
    bassGain   = bassSlider.value();
    midGain    = midSlider.value();
    trebleGain = trebleSlider.value();

    // Normalize to 0–1
    bassN   = bass   / 255;
    midN    = mid    / 255;
    trebleN = treble / 255;

    // Apply EQ gains
    bassN   = constrain(bassN   * bassGain,   0, 1);
    midN    = constrain(midN    * midGain,    0, 1);
    trebleN = constrain(trebleN * trebleGain, 0, 1);
  } else {
    bassN = midN = trebleN = 0;
  }

  // === GRID OF FACES ===
  let cols = 3;
  let rows = 2;
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

  // Show/label sliders only when EQ is toggled on
  if (showEQ) {
    fill(0, 0, 100);
    noStroke();
    textSize(14);
    textAlign(LEFT, CENTER);

    text("Bass Gain", bassSlider.x * 2 + bassSlider.width, 27);
    text("Mid Gain", midSlider.x * 2 + midSlider.width, 57);
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
    randomizeColors();
  }
}