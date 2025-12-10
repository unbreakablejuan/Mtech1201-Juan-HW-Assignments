let numRows = 20, numCols = 20;
let sliderX, sliderY, spawnEverySlider;

let fallers = []; // each: { col, y, speed }

function setup() {
  createCanvas(windowWidth, windowHeight);

  sliderX = createSlider(1, 50, 20, 1);
  sliderY = createSlider(1, 50, 20, 1);
  spawnEverySlider = createSlider(5, 120, 30, 1); // frames between spawns

  // optional: position sliders
  sliderX.position(10, 10);
  sliderY.position(10, 40);
  spawnEverySlider.position(10, 70);
  textSize(12);
}

function draw() {
  background(220, 50);

  numCols = sliderX.value();
  numRows = sliderY.value();

  // 1) SPAWN: add a new faller every N frames
  const spawnEvery = spawnEverySlider.value();
  if (frameCount % spawnEvery === 0) {
    spawnFaller();
  }

  // 2) UPDATE: move each faller down
  for (let f of fallers) {
    f.y += f.speed; // speed controls vertical rate
  }

  // 3) REMOVE: drop any that passed the bottom
  fallers = fallers.filter(f => f.y < numRows);

  // 4) FAST LOOKUP: mark occupied cells in a Set for O(1) checks
  const occupied = new Set();
  for (let f of fallers) {
    const key = f.col + "," + int(f.y);
    occupied.add(key);
  }

  // 5) DRAW GRID: fill red if a faller occupies this cell
  for (let x = 0; x < numCols; x++) {
    for (let y = 0; y < numRows; y++) {
      const key = x + "," + y;
      if (occupied.has(key)) {
        fill(255, 0, 0);
      } else {
        fill(255);
      }
      rect(x * width / numCols, y * height / numRows, width / numCols, height / numRows);
    }
  }

  // UI labels (optional)
  noStroke();
  fill(0);
  text(`Cols: ${numCols}`, sliderX.x * 2 + sliderX.width, 20);
  text(`Rows: ${numRows}`, sliderY.x * 2 + sliderY.width, 50);
  text(`Spawn every: ${spawnEvery} frames`, spawnEverySlider.x * 2 + spawnEverySlider.width, 80);
  text(`Active blocks: ${fallers.length}`, 10, 100);
}

function spawnFaller() {
  // choose a random column on the current grid
  const col = floor(random(numCols));
  // start above the top row so it "enters" smoothly
  const y = -1;
  // random speed; tweak range to taste
  const speed = random(0.15, 0.6);

  fallers.push({ col, y, speed });
}