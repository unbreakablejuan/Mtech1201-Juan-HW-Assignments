let butpos;
let hasResetOnce = false;   // after first reset, Try Again runs away
let resetCount = 0;         // count how many times we've reset
let lightsOut = false;      // after 2nd reset, turn off lights

let btnX, btnY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  butpos = 70;
  textAlign(CENTER, CENTER);

  // initial Try Again button position
  btnX = windowWidth / 2;
  btnY = windowHeight / 2 + windowHeight / 3;
}

function draw() {
  background(121, 246, 170);

  stroke(62, 217, 230);
  strokeWeight(windowHeight / 64);

  // Main big rectangle
  fill(255);
  rect(windowWidth / 2, windowHeight / 2,
       windowWidth / 2, windowHeight / 4,
       60, 60, 60, 60);

  // Sliding frustrating button
  fill(121, 246, 170);
  rect(windowWidth / 2 - butpos, windowHeight / 2,
       windowWidth / 4, windowHeight / 5,
       60, 60, 60, 60);

  // TRY AGAIN BUTTON
  let btnW = windowWidth / 4;
  let btnH = windowHeight / 8;

  // After first reset: Try Again runs away
  if (hasResetOnce) {
    let d = dist(mouseX, mouseY, btnX, btnY);
    if (d < 130) {
      let angle = atan2(btnY - mouseY, btnX - mouseX);
      btnX += cos(angle) * 40;
      btnY += sin(angle) * 40;
    }

    // keep on screen
    btnX = constrain(btnX, btnW / 2, width - btnW / 2);
    btnY = constrain(btnY, btnH / 2, height - btnH / 2);
  }

 
  fill(255);
  rect(btnX, btnY, btnW, btnH, 60);

  fill(62, 217, 230);
  noStroke();
  textFont("Baloo 2");
  textSize(30);
  text("Try Again", btnX, btnY);

  
  // FLASHLIGHT EFFECT
if (lightsOut) {
  // 1. Draw a mostly-black transparent overlay ON TOP of everything
  fill(0, 240); // almost black, slightly see-through
  noStroke();
  rect(width/2, height/2, width, height);

  // 2. Punch a hole in it around the mouse
  erase();           // switch to erasing mode
  let flashlightSize = min(width, height) / 2;
  ellipse(mouseX, mouseY, flashlightSize);
  noErase();         // back to normal
}
}

function mouseClicked() {
  let btnW = windowWidth / 4;
  let btnH = windowHeight / 8;

  // Click on Try Again?
  if (
    mouseX > btnX - btnW / 2 &&
    mouseX < btnX + btnW / 2 &&
    mouseY > btnY - btnH / 2 &&
    mouseY < btnY + btnH / 2
  ) {
    // Always resets sliding button
    butpos = 70;
    resetCount++;

    // First time: enable runaway behavior
    if (!hasResetOnce) {
      hasResetOnce = true;
    }

    // After 2nd reset: turn off lights
    if (resetCount >= 2) {
      lightsOut = true;
    }

    return;
  }

  // Otherwise move the frustrating sliding button
  butpos += 140;
}

// 🌟 SECRET RESET BUTTON — PRESS "R"
function keyPressed() {
  if (key === 'r' || key === 'R') {
    butpos = 70;

    resetCount++;
    if (resetCount >= 2) {
      lightsOut = true;
    }

    // If you want R to be a full clean reset instead, you can:
    // resetCount = 0;
    // lightsOut = false;
    // hasResetOnce = false;

    // Reset Try Again position (optional for sanity)
    btnX = windowWidth / 2;
    btnY = windowHeight / 2 + windowHeight / 3;

    console.log("SECRET RESET USED");
  }
}