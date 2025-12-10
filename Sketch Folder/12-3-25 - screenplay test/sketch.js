/**
Simple typewriter effect
Pippin Barr

This is a very simple (and not especially flexible) way to display text as if it's being written on a typewriter.
*/

// Here's what it will type (made it multi-line for fun)
let string = `Harold, it's Bateman. Patrick Bateman. You're my lawyer so I think you should know-I've killed a lot of people. Some escort girls, in an apartment uptown, some homeless people, maybe five or ten, an NYU girl I met in Central Park. I left her in a parking lot, near Dunkin' Donuts. I killed Bethany,my old girlfriend,with a nail gun, and a man, some old faggot with a dog.Last week I killed another girl with a chainsaw-I had to, she almost got away There was someone else there, maybe a model, I can't remember but she's dead too. And Paul Owen. I killed Paul Owen with an ax, in the face. His body is dissolving in a bathtub in Hell's Kitchen. I don't want to leave anything out here...I guess I've killed 20 people, maybe 40-I have tapes of a lot of it. Some of the girls have seen the tapes, I even...well, I ate some of their brains and I tried to cook a little. Tonight I just, well, I had to kill a lot of people and I'm not sure I 'm going to get away with it this time-I mean I guess I'm a pretty sick guy. So-if you get hack tomorrow, I may show up at Harry's Bar, so, you know, keep your eyes open.`;
// Which character in the string are we up to on the typewriter
let currentCharacter = 10;
// Page margins for a sheet of paper effect
let pageMargin = 100


function setup() {
  createCanvas(windowWidth, windowHeight);
}

/**
Draws a sheet of paper and the current amount of the string that's being typed
*/
function draw() {
  background(255);
  
  // Work out the current string we're writing (the substring of the full string that the typewriter has written so far)
  // The substring() method will return all the characters of a string
  // between the starting and ending positions (starts at 0)
  let currentString = string.substring(0, currentCharacter);
  
  // Draw a sheet of paper (using the pageMargin variable)
  push();
  fill(255, 255,200);
  noStroke();
  rect(pageMargin, pageMargin, width - pageMargin*2, height - pageMargin);
  pop();
  
  // Draw the current string on the page, with some margins
  push();
  textSize(12);
  textFont(`Courier`);
  textAlign(CENTER, TOP);
  text(currentString, pageMargin + 10, pageMargin + 10, width - pageMargin*2, height - pageMargin);
  pop();
  
  // Increase the current character so that we get a longer and
  // longer substring above. Using fractional numbers allows us to
  // slow down the pace.
  currentCharacter += random(0,1 );
  // currentCharacter += random(0,0.5); // Try adding random amounts for a more "naturalistic" pace of typing
}