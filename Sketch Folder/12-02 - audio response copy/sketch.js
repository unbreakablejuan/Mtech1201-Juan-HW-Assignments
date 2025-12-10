let mic;
let mouthH = 0;
let offset = 5;
let c1, c2, c3;

// --- Blink variables ---
let eyeOpenAmount = 1.0;
let blinkStart = 0;
let blinkDuration = 200;
let nextBlink = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  mic = new p5.AudioIn();

 
  c1 = color('#FA5B5A');
  c2 = color('#7BC7F9');
  c3 = color('#FAF95A');
}

function draw() {
  background(c2);

  let now = millis();

  // === HANDLE BLINKING ===
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
  
  noStroke();      // <-- call it
  fill(c3);
  ellipse((width/2) - (width/5), (height/2) - (height/5.5), eyeW, eyeH);
  fill(c1);
  ellipse(((width/2) - (width/5)) - offset, ((height/2) - (height/5.5)) - offset, eyeW, eyeH);

  fill(c3);
  ellipse((width/2) + (width/5), (height/2) - (height/8), eyeW, eyeH);
  fill(c1);
  ellipse(((width/2) + (width/5)) - offset, ((height/2) - (height/8)) - offset, eyeW, eyeH);

  // ==== MOUTH ====
  fill(c3);
  noStroke();

  let level = mic.getLevel();
  let minMouthHeight = windowHeight / 30;
  let maxMouthHeight = windowHeight / 6;

  let targetMouthH = map(level, 0, 0.03, minMouthHeight, maxMouthHeight, true);
  mouthH = lerp(mouthH, targetMouthH, 0.4);

  rect(windowWidth / 2, windowHeight / 2, windowWidth / 8, mouthH);
  fill(c1);
  rect((windowWidth / 2) - offset, (windowHeight / 2) - offset,
       (windowWidth / 8) - offset, mouthH - offset);
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}