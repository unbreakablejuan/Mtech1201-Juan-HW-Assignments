let mic;
let fft;
let peakDetect;

// raw values
let bassRaw = 0;
let midRaw = 0;
let trebleRaw = 0;

// transformed values
let bassCleaned = 0;
let bassLog = 0;

// final normalized values (after gain)
let bassN = 0;
let midN = 0;
let trebleN = 0;

// gain controls
let bassGain = 0.4;
let midGain = 1.0;
let trebleGain = 2.0;

let bassSlider, midSlider, trebleSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('monospace');
  textAlign(LEFT, TOP);

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);

  peakDetect = new p5.PeakDetect(20, 200, 0.35, 20);

  // sliders
  bassSlider = createSlider(0, 3, bassGain, 0.01);
  midSlider = createSlider(0, 3, midGain, 0.01);
  trebleSlider = createSlider(0, 5, trebleGain, 0.01);

  bassSlider.position(20, 20);
  midSlider.position(20, 50);
  trebleSlider.position(20, 80);
}

function draw() {
  background(20);

  // === AUDIO ===
  if (mic && mic.enabled) {
    fft.analyze();
    peakDetect.update(fft);

    // Raw energy
    bassRaw   = fft.getEnergy(20, 120);
    midRaw    = fft.getEnergy(120, 2000);
    trebleRaw = fft.getEnergy(2000, 8000);

    bassGain   = bassSlider.value();
    midGain    = midSlider.value();
    trebleGain = trebleSlider.value();

    // ================================
    // BASS PROCESSING WITH LOG BOOST
    // ================================

    // 1) Divide by 100 (soften constant rumble)
    bassCleaned = bassRaw / 100;
    bassCleaned = constrain(bassCleaned, 0, 1);

    // 2) Apply logarithmic motion boost
    bassLog = log(bassCleaned + 1);   // log(1)=0 so silence = no motion
    bassLog *= 3;                     // optional scaling factor

    // 3) Apply gain + clamp
    bassN = constrain(bassLog * bassGain, 0, 1);

    // ================================
    // MID + TREBLE USE NORMAL RESPONSE
    // ================================
    midN    = bandResponse(midRaw, midGain,    5, 120, 0.6);
    trebleN = bandResponse(trebleRaw, trebleGain, 2, 80, 0.7);

  } else {
    bassN = midN = trebleN = 0;
  }

  drawVisualizer();
}

function bandResponse(energy, gain, floor, ceiling, curve = 0.6) {
  let norm = map(energy, floor, ceiling, 0, 1, true);
  norm = pow(norm, curve);
  norm *= gain;
  return constrain(norm, 0, 1);
}

function drawVisualizer() {
  fill(255);
  textSize(16);
  text("Frequency Debugger with LOG-Enhanced Bass\n(click to enable mic)", 20, 120);

  let barWidth = width / 6;
  let maxH = height * 0.35;
  let baseY = height * 0.85;

  // ---------------------------
  // BASS SECTION
  // ---------------------------

  // RAW
  let h1 = (bassRaw / 255) * maxH;
  fill(0, 150, 255);
  rect(barWidth * 0.8, baseY - h1, barWidth, h1);
  fill(255);
  text(`Bass Raw:        ${nf(bassRaw, 3, 1)}`, barWidth * 0.8, baseY - h1 - 40);

  // CLEANED
  let h2 = bassCleaned * maxH;
  fill(0, 200, 180);
  rect(barWidth * 1.8, baseY - h2, barWidth, h2);
  fill(255);
  text(`Bass Cleaned (/100): ${bassCleaned.toFixed(3)}`, barWidth * 1.8, baseY - h2 - 40);

  // LOG OUTPUT
  let h3 = bassLog / 3 * maxH;  // divide by 3 to show normalized height
  fill(0, 255, 120);
  rect(barWidth * 2.8, baseY - h3, barWidth, h3);
  fill(255);
  text(`Bass Log:        ${bassLog.toFixed(3)}`, barWidth * 2.8, baseY - h3 - 40);

  // FINAL NORMALIZED (what you feed to faces)
  let h4 = bassN * maxH;
  fill(120, 255, 120);
  rect(barWidth * 3.8, baseY - h4, barWidth, h4);
  fill(255);
  text(`Bass Final N:    ${bassN.toFixed(3)}`, barWidth * 3.8, baseY - h4 - 40);


  // ---------------------------
  // MID + TREBLE
  // ---------------------------

  fill(255);
  text(`Mid Raw:         ${nf(midRaw, 3, 1)}`, barWidth * 4.8, baseY - 200);
  text(`Mid N:           ${midN.toFixed(3)}`, barWidth * 4.8, baseY - 180);

  fill(255);
  text(`Treble Raw:      ${nf(trebleRaw, 3, 1)}`, barWidth * 4.8, baseY - 140);
  text(`Treble N:        ${trebleN.toFixed(3)}`, barWidth * 4.8, baseY - 120);
}

function mousePressed() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }
  mic.start();
}