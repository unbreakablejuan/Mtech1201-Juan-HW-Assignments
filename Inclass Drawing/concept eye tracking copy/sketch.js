/* ============================
   SPOOKY EYES — DROP-IN SKETCH
   - One pair of scary eyes that track your face (ml5 FaceMesh)
   - Unified gaze (no cross-eye), deadzone + smoothing (no center spaz)
   - Slit pupils, red glow, jagged lids, random blinks, micro-saccades
   - EASY WIDTH SPACING: change EYE_SPACING below
   ============================ */

// ======= EASY KNOB: spacing between eye centers (in pixels) =======
const EYE_SPACING = 400;   // 👈 make wider (e.g., 360) or closer (e.g., 180)

// Eye size (per eye). Tweak to taste.
const EYE_WIDTH  = 260;
const EYE_HEIGHT = 170;

// ---- Tracking + motion tuning ----
const TARGET_SMOOTH = 0.22; // EMA for target (0..1) higher = snappier
const GAZE_SMOOTH   = 0.16; // EMA for unified direction
const PUPIL_SMOOTH  = 0.35; // EMA for pupil glide
const DEADZONE_K    = 0.12; // deadzone radius as % of eye width
const MAX_STEP_K    = 0.6;  // limit per-frame pupil jump as % of travel

// ---- Style ----
const GLOW_ALPHA  = 0.25; // red glow strength (0..1)
const IRIS_RINGS  = 8;    // concentric rings for iris texture
const BLINK_MIN_S = 3.5;  // random blink cadence
const BLINK_MAX_S = 8.0;

// ====== Runtime state ======
let video, faceMesh;
let targetX = null, targetY = null, lastSeen = 0;
let statusMsg = "Requesting camera…";

let L = { x: null, y: null, w: EYE_WIDTH, h: EYE_HEIGHT, px: null, py: null };
let R = { x: null, y: null, w: EYE_WIDTH, h: EYE_HEIGHT, px: null, py: null };

let tSmoothX, tSmoothY; // smoothed target
let gazeDX = 0, gazeDY = 0; // unified gaze direction
let nextBlinkT = 0, blinkAmt = 0; // 0=open,1=closed
let seedLids;

// ===== Helpers =====
function microJitter(t){ return (noise(t*1.7) - 0.5) * 0.35; }
function hypot(a,b){ return Math.sqrt(a*a + b*b); }
function scheduleBlink(){ nextBlinkT = millis()/1000 + random(BLINK_MIN_S, BLINK_MAX_S); }
function placeEyes() {
  const gap = EYE_SPACING;
  L.x = width/2 - gap/2;  L.y = height/2 + 10;
  R.x = width/2 + gap/2;  R.y = height/2 + 10;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  placeEyes();

  // init smoothed target at head center + pupils at centers
  const headX = (L.x + R.x) * 0.5;
  const headY = (L.y + R.y) * 0.5;
  tSmoothX = headX; tSmoothY = headY;
  L.px = L.x; L.py = L.y; R.px = R.x; R.py = R.y;

  // Webcam
  video = createCapture({ video: { facingMode: "user", width: 640, height: 480 } });
  video.size(640, 480);
  video.hide();
  video.elt.setAttribute("playsinline", "");

  // FaceMesh (use detectStart for broad ml5 compatibility)
  const opts = { maxFaces: 1, refineLandmarks: true, flipHorizontal: true };
  faceMesh = ml5.faceMesh(video, opts, () => {
    statusMsg = "FaceMesh ready — detecting…";
    faceMesh.detectStart(video, gotFaces);
  });

  scheduleBlink();
  seedLids = floor(random(1e6)); // consistent jagged lids per load
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeEyes(); // uses EYE_SPACING
}

function gotFaces(results) {
  if (results && results.length > 0) {
    const f = results[0];
    const nose = (f.annotations?.noseTip?.[0]) || (f.keypoints?.[1]) || (f.scaledMesh?.[1]);
    if (nose) {
      const nx = nose[0] ?? nose.x, ny = nose[1] ?? nose.y;
      targetX = map(nx, 0, video.width, 0, width);
      targetY = map(ny, 0, video.height, 0, height);
      lastSeen = millis();
      statusMsg = "Tracking face ✓";
    }
  } else if (millis() - lastSeen > 500) {
    statusMsg = "No face — mouse fallback";
  }
}

function draw() {
  background(0);

  // Target: recent face or mouse
  const recent = (millis() - lastSeen) < 300;
  const tx = (targetX != null && recent) ? targetX : mouseX;
  const ty = (targetY != null && recent) ? targetY : mouseY;

  // Smooth target (EMA)
  tSmoothX = lerp(tSmoothX, tx, TARGET_SMOOTH);
  tSmoothY = lerp(tSmoothY, ty, TARGET_SMOOTH);

  // Unified gaze from head center, with deadzone + micro saccades
  const headX = (L.x + R.x) * 0.5;
  const headY = (L.y + R.y) * 0.5;
  let dx = tSmoothX - headX;
  let dy = tSmoothY - headY;
  const dist = max(1, hypot(dx, dy));
  const deadzone = ((L.w + R.w) * 0.5) * DEADZONE_K;

  let ndx = 0, ndy = 0;
  if (dist > deadzone) {
    ndx = dx / dist; ndy = dy / dist;
    // tiny jitter to make it unsettling
    const t = millis() / 1000;
    ndx += microJitter(t); ndy += microJitter(t + 1000);
    const m = max(1, hypot(ndx, ndy)); ndx /= m; ndy /= m;
  }
  gazeDX = lerp(gazeDX, ndx, GAZE_SMOOTH);
  gazeDY = lerp(gazeDY, ndy, GAZE_SMOOTH);

  // Blink animation (quick pulse)
  const tNow = millis() / 1000;
  if (tNow >= nextBlinkT) {
    // ~180 ms triangular pulse
    const phase = (tNow - nextBlinkT) / 0.18;
    if (phase <= 1) {
      blinkAmt = 1 - abs(1 - phase * 2);
    } else {
      blinkAmt = 0; scheduleBlink();
    }
  } else {
    blinkAmt *= 0.92; // occasional half-blink decay
  }

  // Draw both eyes in scary style
  drawScaryEye(L, gazeDX, gazeDY, blinkAmt);
  drawScaryEye(R, gazeDX, gazeDY, blinkAmt);

  // Optional debugging:
  // fill(140,255,140); textSize(12); textFont('monospace');
  // text(`spacing:${EYE_SPACING}px`, 12, 20);
}

function drawScaryEye(eye, dirX, dirY, blink) {
  // Pupil desired position along shared direction
  const maxR = min(eye.w, eye.h) * 0.28;
  const desX = eye.x + dirX * maxR;
  const desY = eye.y + dirY * maxR;

  // Limit step size for stability
  const maxStep = maxR * MAX_STEP_K;
  const sdx = desX - eye.px, sdy = desY - eye.py;
  const sdist = hypot(sdx, sdy);
  let nextX = desX, nextY = desY;
  if (sdist > maxStep) {
    const k = maxStep / sdist;
    nextX = eye.px + sdx * k; nextY = eye.py + sdy * k;
  }

  // Smooth glide to next
  eye.px = lerp(eye.px, nextX, PUPIL_SMOOTH);
  eye.py = lerp(eye.py, nextY, PUPIL_SMOOTH);

  // ----- Outer red glow -----
  push();
  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = `rgba(255,0,0,${GLOW_ALPHA})`;
  noStroke(); fill(30);
  ellipse(eye.x, eye.y, eye.w + 12, eye.h + 12);
  pop();

  // ----- Sclera (squash with blink) -----
  const open = max(0.15, 1.0 - blink * 1.1);
  noStroke(); fill(240);
  ellipse(eye.x, eye.y, eye.w, eye.h * open);

  // ----- Iris texture (dark red rings) -----
  const irisR = eye.w * 0.36;
  push();
  translate(eye.px, eye.py);
  for (let i = IRIS_RINGS; i >= 1; i--) {
    const a = map(i, 1, IRIS_RINGS, 0.55, 0.12);
    fill(180, 0, 0, 255 * a);
    ellipse(0, 0, (irisR * i / IRIS_RINGS) * 2, (irisR * i / IRIS_RINGS) * 2 * 0.9);
  }
  pop();

  // ----- Vertical slit pupil (slight tilt) -----
  const pW = eye.w * 0.10;
  const pH = eye.h * 0.58 * open;
  const tilt = radians(-6);
  push();
  translate(eye.px, eye.py);
  rotate(tilt);
  fill(10);
  rectMode(CENTER);
  rect(0, 0, pW, pH, pW * 0.45);
  fill(0, 100);
  rect(0, 0, pW * 1.6, pH * 1.08, pW * 0.55);
  pop();

  // ----- Specular highlight -----
  push();
  noStroke();
  fill(255, 255, 255, 220);
  ellipse(eye.px - eye.w * 0.07, eye.py - eye.h * 0.07, eye.w * 0.08, eye.w * 0.08);
  fill(180, 220, 255, 140);
  ellipse(eye.px - eye.w * 0.11, eye.py - eye.h * 0.11, eye.w * 0.05, eye.w * 0.05);
  pop();

  // ----- Jagged eyelids (upper & lower) -----
  drawJaggedLid(eye, open, true);
  drawJaggedLid(eye, open, false);
}

function drawJaggedLid(eye, open, upper) {
  randomSeed(seedLids + (upper ? 1 : 2) + floor(eye.x * 13.37));
  const w = eye.w, h = eye.h * open;
  const yEdge = upper ? (eye.y - h / 2) : (eye.y + h / 2);
  const dir = upper ? -1 : +1;
  const spikes = 8;
  noStroke();
  fill(0);
  beginShape();
  vertex(eye.x - w / 2 - 2, yEdge);
  for (let i = 0; i <= spikes; i++) {
    const t = i / spikes;
    const x = lerp(eye.x - w / 2 - 2, eye.x + w / 2 + 2, t);
    const amp = (upper ? 1.0 : 0.9) * (0.10 + 0.18 * noise(i * 0.7));
    const y = yEdge + dir * (eye.h * amp);
    vertex(x, y);
  }
  vertex(eye.x + w / 2 + 2, yEdge);
  endShape(CLOSE);
}