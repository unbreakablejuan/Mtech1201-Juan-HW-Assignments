let mic;
let fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);
}

function draw() {
  background(20);

  fft.analyze();

  let bass   = fft.getEnergy("bass");   // 20–140 Hz
  let mid    = fft.getEnergy("mid");    // 140–4000 Hz
  let treble = fft.getEnergy("treble"); // 4000+ Hz

  // 1) Normalize to 0–1
  let bassN   = bass   / 255;
  let midN    = mid    / 255;
  let trebleN = treble / 255;

  // 2) Apply per-band visual gains
  let bassGain   = 0.4; // turn bass down
  let midGain    = 1.0; // mids normal
  let trebleGain = 10.0; // boost treble

  bassN   = constrain(bassN   * bassGain,   0, 1);
  midN    = constrain(midN    * midGain,    0, 1);
  trebleN = constrain(trebleN * trebleGain, 0, 1);

  // 3) Map normalized 0–1 values to sizes
  let bassSize   = map(bassN,   0, 1, 20, 400);
  let midSize    = map(midN,    0, 1, 20, 300);
  let trebleSize = map(trebleN, 0, 1, 20, 250);

  

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}