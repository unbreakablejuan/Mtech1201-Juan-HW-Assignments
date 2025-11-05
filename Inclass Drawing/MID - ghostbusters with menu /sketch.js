
let ghostbusters;      // optional title image
let slimer, hallway;   // game assets
let buttonCamera, buttonMouse;
let mode = "menu"; 

// mouse variables
let diameter = 150;
let count = 0;
let x = 0;
let y = 0;
let difficulty = 0;
let easy = 0.009;
let medium = 0.05;
let hard = 0.13;
let newX = 0, newY = 0;
let newPointIntervalId = null;

function preload() {
  ghostbusters = loadImage("ghostbusters.png");
  slimer = loadImage("slimer.png");
  hallway = loadImage("hotelhallway.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  noStroke();

  // Create buttons once
  buttonCamera = createButton('Camera Tracking');
  buttonCamera.size(220, 55);
  buttonCamera.mousePressed(() => startGameCamera()); // stubbed scene
  buttonCamera.position(windowWidth/2 - 100, windowHeight/2+300)

  buttonMouse = createButton('Mouse Tracking');
  buttonMouse.size(220, 55);
  buttonMouse.mousePressed(() => startGameMouse());
  buttonMouse.position(windowWidth/2 - 100, windowHeight/2+370)

  
}

function draw() {
  background(0);

  if (mode === "menu") {
    // ===== MENU =====
    if (ghostbusters) {
      image(ghostbusters, width/2, height/2 - 120, 800, 800);
    }
    fill(255);
    textSize(20);
    text('Choose a mode to start', width/2, height/2 + 275);

  } else if (mode === "game-mouse") {
    
    hideButtons();
    gameMouseUpdate();
    gameMouseRender();

    

  } else if (mode === "in-construction") {
    // will add camera intigration later
    hideButtons();
    background(15, 25, 40);
    fill(255);
    textSize(28);
    text("Camera mode not wired yet.", width/2, height/2);
    textSize(14);
    text("Press ESC to return to menu", width/2, height/2 + 40);
  }
}

// Scene Control
function startGameMouse() {
  mode = "game-mouse";
  gameMouseInit();
  hideButtons();
}

function startGameCamera() {
  mode = "game-camera";
  // If you add ml5 here, init it now.
  hideButtons();
}

function returnToMenu() {
  // Stop any game timers/loops
  if (newPointIntervalId) {
    clearInterval(newPointIntervalId);
    newPointIntervalId = null;
  }
  mode = "menu";
  showButtons();
}


function positionButtons() {
  buttonCamera.position(windowWidth/2 - 100, windowHeight/2+300)
  buttonMouse.position(windowWidth/2 - 100, windowHeight/2+370)
  buttonCamera.show();
  buttonMouse.show();
}

function hideButtons() {
  if (buttonCamera) buttonCamera.hide();
  if (buttonMouse) buttonMouse.hide();
}

function showButtons() {
  if (buttonCamera) buttonCamera.show();
  if (buttonMouse) buttonMouse.show();
  positionButtons();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (mode === "menu") positionButtons();
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    returnToMenu();
  }

  // Difficulty keys only in game
  if (mode === "game-mouse") {
    if (key === '1') difficulty = "Easy";
    else if (key === '2') difficulty = "Medium";
    else if (key === '3') difficulty = "Hard";
    if (key === 'r') count=0;
  }
}


function gameMouseInit() {
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);

  
  count = 0;
  difficulty = "Medium"; // default

  // Start random target updates
  if (!newPointIntervalId) {
    newPointIntervalId = setInterval(newPoint, 500);
  }
}

function gameMouseUpdate() {
  // Move slimer toward random point at speed based on difficulty
  let speed;
  if (difficulty === "Easy") {
    speed = easy;
  } else if (difficulty === "Medium") {
    speed = medium;
  } else if (difficulty === "Hard") {
    speed = hard;
  } else {
    speed = medium; // default
  }

  x = lerp(x, newX, speed);
  y = lerp(y, newY, speed);

  // Detect catch
  const d = dist(mouseX, mouseY, x, y);
  if (d < 200) {
    count++;
  }
}

function gameMouseRender() {
  //Background
  image(hallway, width/2, height/2, width, height);

  // Slimer sprite
  image(slimer, x, y, 150, 150);

  // Player cursor / aim UI
  noFill();              
  stroke(255,0,0);
  ellipse(mouseX, mouseY, 200, 200);
  strokeWeight(20);
  line(mouseX - 65, mouseY - 65, mouseX + 65, mouseY + 65);

  // Score & difficulty
  noStroke();
  fill(255, 255, 0);
  textSize(24);
  text("Score: " + count, width / 2, height - 50);
  text("Difficulty: " + difficulty, width / 2, height - 80);
  

  // HUD
    fill(255,255,0);
    textSize(14);
    text("Press ESC to return to menu (1=Easy, 2=Medium, 3=Hard) R=Reset Score", width/2, height-20);
}

function newPoint() {
  if (mode !== "game-mouse") return; 
  newX = random(width);
  newY = random(height);
}



