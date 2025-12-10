let drips = [];

let string = `Harold, it's Bateman. Patrick Bateman. You're my lawyer so I think you should know-I've killed a lot of people. Some escort girls, in an apartment uptown, some homeless people, maybe five or ten, an NYU girl I met in Central Park. I left her in a parking lot, near Dunkin' Donuts. I killed Bethany,my old girlfriend,with a nail gun, and a man, some old faggot with a dog.Last week I killed another girl with a chainsaw-I had to, she almost got away There was someone else there, maybe a model, I can't remember but she's dead too. And Paul Owen. I killed Paul Owen with an ax, in the face. His body is dissolving in a bathtub in Hell's Kitchen. I don't want to leave anything out here...I guess I've killed 20 people, maybe 40-I have tapes of a lot of it. Some of the girls have seen the tapes, I even...well, I ate some of their brains and I tried to cook a little. Tonight I just, well, I had to kill a lot of people and I'm not sure I 'm going to get away with it this time-I mean I guess I'm a pretty sick guy. So-if you get hack tomorrow, I may show up at Harry's Bar, so, you know, keep your eyes open.`;
let s = 15;

let currentCharacter = 10;
// Page margins for a sheet of paper effect
let pageMargin = 100

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);
  noStroke();
}

function draw() {  
  let currentString = string.substring(0, currentCharacter);
  for(let i = drips.length - 1; i >= 0; i --) {
    drips[i].update();
    if(drips[i].r < 0) {
      drips.splice(i, 1);
      continue;
    }
    drips[i].draw();
  }
  push();
  fill(100,100,400)
  noStroke();
  rect(pageMargin, pageMargin, width - pageMargin*2, height - pageMargin);
  pop();
  
  // Draw the current string on the page, with some margins
  push();
  textSize(12);
  fill(0)
  textFont(`Courier`);
  textAlign(CENTER, TOP);
  text(currentString, pageMargin + 10, pageMargin + 10, width - pageMargin*2, height - pageMargin);
  pop();
  
  // Increase the current character so that we get a longer and
  // longer substring above. Using fractional numbers allows us to
  // slow down the pace.
  currentCharacter += random(0,1 );
}

function mouseReleased() {
  drips.push(new Drip(random(0,width), 0, random(5, 10)));
}

class Drip {
  
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.startR = r;
    this.maxSpeed = map(r, 5, 10, 3, 6);
  }
  
  update() {
    this.y += map(this.r, this.startR, 0, this.maxSpeed, 0);
    this.x += random(-0.5, 0.5);
    this.r -= 0.05;
  }
  
  draw() {
    let a = map(this.r, this.startR, 0, 255, 0);
    fill(230,50,50,a);
    circle(this.x, this.y, this.r * 2);
  }
}