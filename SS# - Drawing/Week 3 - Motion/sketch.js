function setup() {
  createCanvas(1200, 800);
  background(0)
  rectMode(CENTER)
  
}

function draw() {
  strokeWeight(5)
  stroke('yellow')
  rect(600,400, 1100,750,50,50,50,50)
  fill(0,0,0)
  rect(600,400,150,200)
  circle(600,370, 50)
  line(300, 775, 300, 25) //inside veritcal left
  line(900, 775, 900, 25) //insdie vertical right
  line(175, 775, 175, 25) //outside vert left
  line(1025, 775, 1025, 25) //outside vert right
  line(525, 430, 675, 430)
  line(525,300, 300,25)
  line(525,333, 50,130)
  line(580,433, 300, 770)
  line(675,300, 900,25)
  line(620,430, 900, 770)
  line(560,430, 175,775)
  line(525,410, 50, 500)
  line(675,333, 1150,130)
  line(675,410, 1150,500)
  line(645,430, 1025,775)
  line(424,176, 424,620)
  line(775,177,775,619)
  line(425,618,775,619)
  strokeWeight(8)
  stroke('red')
  
  line(480,0,480,800)
  line(720,0,720,800)

}

