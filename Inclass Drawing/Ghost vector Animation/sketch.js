let funcSelect = 0; // 0=none, 1=camera (stub), 2=mouse
let button1, button2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Buttons (create once)
  button1 = createButton('Camera Tracking');
  button1.position(windowWidth/2 - 100, windowHeight/2);
  button1.size(200, 100);
  button1.mousePressed(select1);

  button2 = createButton('Mouse Tracking');
  button2.position(windowWidth/2 - 100, windowHeight/2 + 125);
  button2.size(200, 100);
  button2.mousePressed(select2);

  funcSelect = 2; // default to mouse tracking so you see it working immediately
}

function draw() {
  background(50, 50, 120);

  // Layout
  const ghostCX = width / 2;
  const ghostCY = height / 8;
  const eyeLevel = ghostCY - 20 + 25; // matches your original offsets
  const leftEyeX = width / 2 - 50;
  const rightEyeX = width / 2 + 50;

  // Draw ghost body
  fill(255);
  circle(ghostCX, ghostCY, 200);
  rectMode(CENTER);
  rect(ghostCX, ghostCY + 95, 200, 200);

  // Eye sockets (black)
  fill(0);
  const eyeSocketSize = 60;
  const eyeSocketR = eyeSocketSize / 2;
  circle(leftEyeX, eyeLevel, eyeSocketSize);
  circle(rightEyeX, eyeLevel, eyeSocketSize);

  // Target to look at (mouse for now; camera tracking can set targetX/Y later)
  let targetX = mouseX;
  let targetY = mouseY;
  // If funcSelect===1 (camera), you can replace targetX/targetY with your hand coords.

  // Pupils (white) constrained inside sockets
  const pupilSize = 15;
  const pupilR = pupilSize/2 ;
  const padding = 2;
  const maxOffset = eyeSocketR - pupilR - padding; // keep pupil inside socket

  const [lpX, lpY] = pupilPosition(leftEyeX, eyeLevel, targetX, targetY, maxOffset);
  const [rpX, rpY] = pupilPosition(rightEyeX, eyeLevel, targetX, targetY, maxOffset);

  fill(255);
  circle(lpX, lpY, pupilSize);
  circle(rpX, rpY, pupilSize);
}

function pupilPosition(eyeX, eyeY, targetX, targetY, maxOffset) {
  const dx = targetX - eyeX;
  const dy = targetY - eyeY;
  const d = Math.hypot(dx, dy);
  if (d === 0) return [eyeX, eyeY];
  const scale = Math.min(maxOffset, d) / d;
  return [eyeX + dx * scale, eyeY + dy * scale];
}

function select1() { funcSelect = 1; }
function select2() { funcSelect = 2; }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposition buttons so they stay centered
  button1.position(windowWidth/2 - 100, windowHeight/2);
  button2.position(windowWidth/2 - 100, windowHeight/2 + 125);
}