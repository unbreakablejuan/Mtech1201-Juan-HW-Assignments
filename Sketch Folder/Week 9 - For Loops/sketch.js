// === Config ===
const NUM_COLS = 160;       // more cols = smaller blocks
const NUM_PARTICLES = 1000; // more particles = denser flow
const SPEED = 1.4;          // step size per frame
const NOISE_SCALE = 0.003;  // flow field granularity
const DOWN_BIAS = 0.6;      // gravity-like bias (0 = no gravity)
const TRAIL_FADE = 24;      // background alpha (smaller = longer trails)
let BRUSH_SIZE = 28;        // obstacle brush radius (px)

// === Runtime ===
let cellW, cellH, numRows;
let particles = [];
let t = 0;
let cnv;
let obstacleLayer;          // p5.Graphics we paint obstacles onto

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  // allow right-click erase without context menu
  cnv.elt.oncontextmenu = () => false;

  // offscreen buffer for obstacles
  obstacleLayer = createGraphics(width, height);
  obstacleLayer.pixelDensity(1);
  obstacleLayer.noStroke();

  computeGrid();
  initParticles();

  noStroke();
  background(230);
  textFont('monospace');
}

function computeGrid() {
  cellW = width / NUM_COLS;
  numRows = floor(height / cellW);  // keep cells roughly square
  cellH = height / numRows;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(width),
      y: random(-height, 0), // start above the screen so they "enter"
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const oldObstacles = obstacleLayer;
  obstacleLayer = createGraphics(width, height);
  obstacleLayer.pixelDensity(1);
  obstacleLayer.noStroke();
  // redraw old obstacle layer scaled to new size
  obstacleLayer.image(oldObstacles, 0, 0, width, height);

  computeGrid();
  // clamp particles into bounds
  for (let p of particles) {
    p.x = (p.x % width + width) % width;
    p.y = (p.y % height + height) % height;
  }
}

function draw() {
  // Trails so motion looks fluid, and avoids bottom accumulation
  background(230, TRAIL_FADE);

  // animate the flow field a touch
  t += 0.0025;

  // 1) Paint obstacles with mouse
  paintObstacles();

  // 2) Update particles with obstacle avoidance
  for (let p of particles) {
    // Flow direction from noise, with a downward bias
    const nx = p.x * NOISE_SCALE;
    const ny = p.y * NOISE_SCALE;
    const angle = noise(nx, ny, t) * TWO_PI * 2.0;
    let vx = cos(angle);
    let vy = sin(angle) + DOWN_BIAS;

    // normalize then scale so SPEED is consistent
    const mag = max(0.0001, sqrt(vx * vx + vy * vy));
    vx = (vx / mag) * SPEED;
    vy = (vy / mag) * SPEED;

    // Proposed next position
    let nxp = p.x + vx;
    let nyp = p.y + vy;

    // If blocked, try to slide around obstacle
    if (blockedAt(nxp, nyp)) {
      // Check perpendicular slide both directions
      const px = -vy, py = vx; // perpendicular vector
      const pmag = max(0.0001, sqrt(px * px + py * py));
      const sx = (px / pmag) * SPEED;
      const sy = (py / pmag) * SPEED;

      const leftFree  = !blockedAt(p.x + sx, p.y + sy);
      const rightFree = !blockedAt(p.x - sx, p.y - sy);

      if (leftFree && !rightFree) {
        nxp = p.x + sx;
        nyp = p.y + sy;
      } else if (!leftFree && rightFree) {
        nxp = p.x - sx;
        nyp = p.y - sy;
      } else if (leftFree && rightFree) {
        // pick the one that looks "less blocked" ahead
        const leftAheadBlocked  = blockedAt(p.x + sx + vx, p.y + sy + vy);
        const rightAheadBlocked = blockedAt(p.x - sx + vx, p.y - sy + vy);
        if (!leftAheadBlocked && rightAheadBlocked) {
          nxp = p.x + sx; nyp = p.y + sy;
        } else if (leftAheadBlocked && !rightAheadBlocked) {
          nxp = p.x - sx; nyp = p.y - sy;
        } else {
          // both equally good/bad; choose randomly for organic feel
          if (random() < 0.5) { nxp = p.x + sx; nyp = p.y + sy; }
          else { nxp = p.x - sx; nyp = p.y - sy; }
        }
      } else {
        // dead-end; nudge upward slightly & jitter sideways to avoid clogging
        nyp = p.y - random(0.4, 1.0);
        nxp = p.x + random([-1, 1]) * 0.7;
      }
    }

    // Move
    p.x = nxp;
    p.y = nyp;

    // Wrap: when falling off bottom, re-enter at top so nothing piles up
    if (p.y >= height) {
      p.y -= height;
      // small x jitter so they don't form vertical stripes on re-entry
      p.x = (p.x + random(-cellW * 2, cellW * 2) + width) % width;
    }
    if (p.x < 0) p.x += width;
    if (p.x >= width) p.x -= width;

    // Draw as tiny grid-aligned blocks
    const col = floor(p.x / cellW);
    const row = floor(p.y / cellH);
    const gx = col * cellW;
    const gy = row * cellH;

    fill(255, 0, 0);
    rect(gx, gy, cellW, cellH);
  }

  // Draw obstacles on top for clarity
  image(obstacleLayer, 0, 0);

  // HUD
  noStroke();
  fill(0, 120);
  text(`Paint obstacles: Left-drag  |  Erase: Right-drag or 'E'  |  Brush +/-  |  Clear: 'C'`, 12, 20);
  text(`Particles: ${NUM_PARTICLES} | Grid: ${NUM_COLS}×${numRows} | Brush: ${BRUSH_SIZE}px`, 12, 36);
}

function paintObstacles() {
  if (!mouseIsPressed) return;
  if (mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height) return;

  const erasing = (mouseButton === RIGHT) || keyIsDown(69); // 'E'
  if (erasing) {
    obstacleLayer.erase();
    obstacleLayer.circle(mouseX, mouseY, BRUSH_SIZE);
    obstacleLayer.noErase();
  } else {
    obstacleLayer.fill(30);   // dark wall
    obstacleLayer.circle(mouseX, mouseY, BRUSH_SIZE);
  }
}

function blockedAt(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return true;
  // Read alpha from obstacle layer; alpha>0 means wall
  const a = obstacleLayer.get(floor(x), floor(y))[3];
  return a > 10; // small threshold so semi-transparency still blocks
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    obstacleLayer.clear(); // wipe all obstacles
  } else if (key === '+' || key === '=') {
    BRUSH_SIZE = min(200, BRUSH_SIZE + 4);
  } else if (key === '-' || key === '_') {
    BRUSH_SIZE = max(4, BRUSH_SIZE - 4);
  } else if (key === 'r' || key === 'R') {
    t = random(1000); // reshuffle flow
  }
}
