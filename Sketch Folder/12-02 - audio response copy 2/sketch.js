let mic;
let mouthH = 0;
let offset = 5;
let c1, c2, c3;


let eyeOpenAmount = 1.0;
let blinkStart = 0;
let blinkDuration = 200;
let nextBlink = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  
  colorMode(HSB, 360, 100, 100);

  mic = new p5.AudioIn();

  // === RANDOM HARMONIOUS PALETTE ===
  let baseHue = random(0, 360);   // random hue on the wheel
  let s = 80;                     // saturation
  let b = 95;                     // brightness

  // You can tweak these offsets for different vibes
  c1 = color(baseHue, s, b);                  // main accent
  c2 = color((baseHue + 120) % 360, s, b);    // background
  c3 = color((baseHue + 240) % 360, s, b);    // secondary accent
}

function draw() {
  background(c2);

  let now = millis();


  if (now > nextBlink) {
    blinkStart = now;
    nextBlink = now + random(2000, 5000);
  }

  let t = (now - blinkStart) / blinkDuration;

  if (t < 1) {
    eyeOpenAmount = 1 - t;
  } else if (t < 2) {
    eyeOpenAmount = t - 1;
  } else {
    eyeOpenAmount = 1;
  }

  eyeOpenAmount = constrain(eyeOpenAmount, 0, 1);

  // ==== EYES ====
  let eyeW = 50;
  let eyeH = 50 * eyeOpenAmount;

  noStroke();

  // Left eye
  fill(c3);
  ellipse((width/2) - (width/5), (height/2) - (height/5.5), eyeW, eyeH);
  fill(c1);
  ellipse(((width/2) - (width/5)) - offset,
          ((height/2) - (height/5.5)) - offset,
          eyeW, eyeH);

  // Right eye
  fill(c3);
  ellipse((width/2) + (width/5), (height/2) - (height/8), eyeW, eyeH);
  fill(c1);
  ellipse(((width/2) + (width/5)) - offset,
          ((height/2) - (height/8)) - offset,
          eyeW, eyeH);

  // ==== MOUTH ====
  fill(c3);
  noStroke();

  let level = mic.getLevel();
  let minMouthHeight = windowHeight / 30;
  let maxMouthHeight = windowHeight / 6;

  let targetMouthH = map(level, 0, 0.2, minMouthHeight, maxMouthHeight, true);
  mouthH = lerp(mouthH, targetMouthH, 0.4);

  rect(windowWidth / 2, windowHeight / 2, windowWidth / 8, mouthH);
  fill(c1);
  rect((windowWidth / 2) - offset,
       (windowHeight / 2) - offset,
       (windowWidth / 8) - offset,
       mouthH - offset);
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}

function touchStarted(){
   if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}

