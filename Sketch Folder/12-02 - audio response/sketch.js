let mic;
let mouthH = 0;

// --- Blink variables ---
let eyeOpenAmount = 1.0;    // 1 = fully open, 0 = fully closed
let blinkStart = 0;
let blinkDuration = 200;     // ms for full close/open
let nextBlink = 2000;        // first blink after 2 sec

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  mic = new p5.AudioIn();
}

function draw() {
  background(169, 244, 44);

  let now = millis();

  // === HANDLE BLINKING ===
  if (now > nextBlink) {
    blinkStart = now;
    nextBlink = now + random(2000, 5000); // blink again in 2–5 sec
  }

  let t = (now - blinkStart) / blinkDuration;

  if (t < 1) {
    // Closing
    eyeOpenAmount = 1 - t;
  } else if (t < 2) {
    // Opening
    eyeOpenAmount = t - 1;
  } else {
    eyeOpenAmount = 1;
  }

  // Clamp
  eyeOpenAmount = constrain(eyeOpenAmount, 0, 1);


  fill(0);
  noStroke();

  let eyeW = 50;
  let eyeH = 50 * eyeOpenAmount; 

  ellipse((width/2) - (width/5), (height/2) - (height/5.5), eyeW, eyeH);
  ellipse((width/2) + (width/5), (height/2) - (height/8),   eyeW, eyeH);

  // ==== MOUTH ====
  fill(245, 79, 44);
  noStroke();

  let level = mic.getLevel();
  let minMouthHeight = windowHeight / 30;
  let maxMouthHeight = windowHeight / 6;

  let targetMouthH = map(level, 0, 0.03, minMouthHeight, maxMouthHeight, true);
  mouthH = lerp(mouthH, targetMouthH, 0.4);

  rect(windowWidth / 2, windowHeight / 2, windowWidth / 8, mouthH);
}


function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  mic.start();
}