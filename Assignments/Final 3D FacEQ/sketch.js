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

let autoPalette = false;  // peak detection default state/ false = no change, true = color changing

let shakeoffset = 15;

// cube size for WEBGL
let cubeSize = 400;

// textures
let faceTextures = [];

//  EYE SHAPES
// All take (pg, x, y, cellW, cellH, size)
let eyeShapes = [
  // Rectangle eye
  (pg, x, y, cellW, cellH, size) => {
    pg.rect(x, y, cellW / size, cellH / size);
  },

  // Triangle eye
  (pg, x, y, cellW, cellH, size) => {
    pg.triangle(
      x - (cellW / size) / 2, y + (cellH / size) / 2,
      x,                      y - (cellH / size) / 2,
      x + (cellW / size) / 2, y + (cellH / size) / 2
    );
  },

  // Circle eye
  (pg, x, y, cellW, cellH, size) => {
    pg.circle(x, y, min(cellW / size, cellH / size));
  },

  // Ellipse eye
  (pg, x, y, cellW, cellH, size) => {
    pg.ellipse(x, y, cellW / size, cellH / size);
  }
];

class Face {
  constructor(baseHue, s, b, bandName) {
    this.shapeSizeRandomizer = random(3, 10);   // per-face size randomizer
    this.bandName = bandName;                  // "bass", "mid", or "treble"

    this.offset = 5;
    this.mouthH = 200;

    this.intialEyeH = 50;
    this.intialEyeW = 50;

    this.leftEyeRan = random(4, 8);
    this.rightEyeRan = random(4, 8);
    this.mouthWidth = random(2, 5);
    this.mouthYloc = 0; 

    // colors 
    this.c1 = color(baseHue, s, b);
    this.c2 = color((baseHue + 120) % 360, s, b);
    this.c3 = color((baseHue + 240) % 360, s, b);

    // blink 
    this.eyeOpenAmount = 1.0;
    this.blinkStart = 0;
    this.blinkDuration = 200;
    this.nextBlink = millis() + random(1000, 3000);

    // each face gets its own eye shapes
    this.leftShape  = random(eyeShapes);
    this.rightShape = random(eyeShapes);
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

 
  drawFace(pg, cx, cy, cellW, cellH) {
    this.updateBlink();

    let offset = this.offset;
    let size = this.shapeSizeRandomizer;
  
const drawBlinkShape = (shapeFn, x, y) => {
  let open = max(0.05, this.eyeOpenAmount); // don’t go to 0
  pg.push();
  pg.translate(x, y);
  pg.scale(1, open);          // squish vertically
  pg.translate(-x, -y);
  shapeFn(pg, x, y, cellW, cellH, size); // <-- IMPORTANT: pass pg
  pg.pop();
};

    pg.noStroke();

    // eye locations
    let leftEyeX  = cx - cellW / this.leftEyeRan;
    let leftEyeY  = cy - cellH / this.leftEyeRan;
    let rightEyeX = cx + cellW / this.rightEyeRan;
    let rightEyeY = cy - cellH / this.rightEyeRan;

    // ==== EYES ====
 // Left eye offset
pg.fill(this.c3);
drawBlinkShape(this.leftShape, leftEyeX, leftEyeY);

// Left eye main
pg.fill(this.c1);
drawBlinkShape(this.leftShape, leftEyeX - offset, leftEyeY - offset);

// Right eye offset
pg.fill(this.c3);
drawBlinkShape(this.rightShape, rightEyeX, rightEyeY);

// Right eye main
pg.fill(this.c1);
drawBlinkShape(this.rightShape, rightEyeX - offset, rightEyeY - offset);

    // ==== MOUTH ====
    pg.fill(this.c3);
    pg.noStroke();

    let bandVal = this.getBandLevel(); // 0–1
    let mouthLevel = pow(bandVal, 0.7);

    let minMouthHeight = cellH / 20;
    let maxMouthHeight = cellH / 3;

    let targetMouthH = map(mouthLevel, 0, 1, minMouthHeight, maxMouthHeight, true);
    this.mouthH = lerp(this.mouthH, targetMouthH, 1);

    let mouthY = cy + cellH * 0.2; // lower than center

    pg.rect(cx, mouthY, cellW / this.mouthWidth, this.mouthH);
    pg.fill(this.c1);
    pg.rect(
      cx - offset,
      mouthY - offset,
      (cellW / 4) - offset,
      this.mouthH - offset
    );
  }
}

//   COLOR RANDOMIZE
function randomizeColors() {
  for (let i = 0; i < faces.length; i++) {
    let baseHue = random(0, 360);
    let s = random(70, 100);   // keep within HSB max
    let b = 100;
    faces[i].c1 = color(baseHue, s, b);
    faces[i].c2 = color((baseHue + 120) % 360, s, b);
    faces[i].c3 = color((baseHue + 240) % 360, s, b);
  }
  if (faces.length > 0) {
    bgColor = faces[0].c2;
  }
}

// mouse press color randoimizer
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

function setup() {
  
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  rectMode(CENTER);
  colorMode(HSB, 360, 100, 100);

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

 
  peakDetect = new p5.PeakDetect(20, 200, 0.35, 20);


  let bands = ["bass", "mid", "treble", "bass", "mid", "treble"];
  for (let i = 0; i < 6; i++) {
    let bandName = bands[i];
    let baseHue = random(0, 360);
    let s = 80;
    let b = 95;
    let f = new Face(baseHue, s, b, bandName);
    faces.push(f);
  }
  bgColor = faces[0].c2;

  // === Create 6 textures for cube faces ===
  for (let i = 0; i < 6; i++) {
    let pg = createGraphics(512, 512);  // power of 2 is nice
    pg.colorMode(HSB, 360, 100, 100);
    pg.rectMode(CENTER);
    faceTextures.push(pg);
  }

  
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

 

  // === AUDIO / FFT ===
  if (mic && mic.enabled) {
    fft.analyze();
    peakDetect.update(fft);

    // Frequency ranges
    let bassRaw   = fft.getEnergy(20, 120);    //
    let midRaw    = fft.getEnergy(120, 2000);  // 
    let trebleRaw = fft.getEnergy(2000, 8000); //

    bassGain   = bassSlider.value();
    midGain    = midSlider.value();
    trebleGain = trebleSlider.value();

    bassN   = bandResponse(bassRaw,   bassGain,   10, 140, 0.1);
    midN    = bandResponse(midRaw,    midGain,    5,  120, 0.6);
    trebleN = bandResponse(trebleRaw, trebleGain, 2,   80, 0.7);

    if (peakDetect.isDetected && autoPalette) {
      triggerPaletteChange();
    }
  } else {
    bassN = midN = trebleN = 0;
  }

  // Update each texture with its own Face 
  for (let i = 0; i < 6; i++) {
    let f = faces[i];
    let pg = faceTextures[i];

    pg.background(f.c2);

    // draw a single cell
    let margin = pg.width * 0.1;
    let cellW = pg.width - margin * 2;
    let cellH = pg.height - margin * 2;
    let cx = pg.width / 2;
    let cy = pg.height / 2;

    // optional background panel
    pg.fill(f.c2);
    pg.noStroke();
    pg.rect(cx, cy, cellW, cellH);

    f.drawFace(pg, cx, cy, cellW, cellH);
  }

let t = (sin(millis() * 0.0005) + 1) / 2;
background(lerp(0, 360, t), 50, 100)


orbitControl();
noStroke();


let angle = frameCount * 0.01;
  rotateZ(angle);
  rotateY(angle);
  rotateX(angle);

// how much the faces "breathe" with audio
let pushAmt = cubeSize * 2


let a0 = faces[0].getBandLevel(); // FRONT
let a1 = faces[1].getBandLevel(); // BACK
let a2 = faces[2].getBandLevel(); // RIGHT
let a3 = faces[3].getBandLevel(); // LEFT
let a4 = faces[4].getBandLevel(); // TOP
let a5 = faces[5].getBandLevel(); // BOTTOM

// FRONT (+Z)
push();
translate(0, 0, cubeSize / 2 + a5 * pushAmt);
texture(faceTextures[0]);
plane(cubeSize, cubeSize);
pop();

// BACK (-Z)
push();
translate(0, 0, -cubeSize / 2 - a5 * pushAmt);
rotateY(PI);
texture(faceTextures[1]);
plane(cubeSize, cubeSize);
pop();

// RIGHT (+X)
push();
translate(cubeSize / 2 + a5 * pushAmt, 0, 0);
rotateY(HALF_PI);
texture(faceTextures[2]);
plane(cubeSize, cubeSize);
pop();

// LEFT (-X)
push();
translate(-cubeSize / 2 - a5 * pushAmt, 0, 0);
rotateY(-HALF_PI);
texture(faceTextures[3]);
plane(cubeSize, cubeSize);
pop();

// TOP (-Y)
push();
translate(0, -cubeSize / 2 - a5 * pushAmt, 0);
rotateX(-HALF_PI);
texture(faceTextures[4]);
plane(cubeSize, cubeSize);
pop();

// BOTTOM (+Y)
push();
translate(0, cubeSize / 2 + a5 * pushAmt, 0);
rotateX(HALF_PI);
texture(faceTextures[5]);
plane(cubeSize, cubeSize);
pop();

//pointLight(lerp(0, 360, t/2), (lerp(0, 360, t*4)),(lerp(0, 360, t)), (lerp(0, 360, t)), (lerp(0, 360, t)), lerp(0, 360, t))
}
function mousePressed() {
  if (getAudioContext().state !== 'running') getAudioContext().resume();
  mic.start();
}

function touchStarted() {
  if (getAudioContext().state !== 'running') getAudioContext().resume();
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

  if (key === 'w' || key === 'W') triggerPaletteChange();
  if (key === 'e' || key === 'E') autoPalette = !autoPalette;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

