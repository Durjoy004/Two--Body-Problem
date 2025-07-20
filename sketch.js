let body1, body2;
let G;
let gSlider, m1Slider, m2Slider, distSlider, dragSlider;
let resetButton;

let trails1 = [];
let trails2 = [];

let canvasDiv, uiDiv;

function setup() {
  // Create outer layout
  canvasDiv = createDiv().style('float', 'left');
  uiDiv = createDiv().style('float', 'left').style('margin-left', '20px');

  // Create canvas inside canvasDiv
  let canvas = createCanvas(800, 800);
  canvas.parent(canvasDiv);

  // UI inside uiDiv
  uiDiv.child(createP("Gravitational Constant (G)"));
  gSlider = createSlider(0.1, 5, 1, 0.1);
  uiDiv.child(gSlider);

  uiDiv.child(createP("Mass of Body 1"));
  m1Slider = createSlider(100, 2000, 1000, 10);
  uiDiv.child(m1Slider);

  uiDiv.child(createP("Mass of Body 2"));
  m2Slider = createSlider(10, 500, 100, 10);
  uiDiv.child(m2Slider);

  uiDiv.child(createP("Initial Distance Between Bodies"));
  distSlider = createSlider(100, 400, 200, 10);
  uiDiv.child(distSlider);

  uiDiv.child(createP("Air Resistance Coefficient (c)"));
  dragSlider = createSlider(0, 0.1, 0, 0.001);
  uiDiv.child(dragSlider);

  resetButton = createButton("Reset Simulation");
  uiDiv.child(resetButton);
  resetButton.mousePressed(resetSimulation);

  resetSimulation();
}

function resetSimulation() {
  G = gSlider.value();
  let m1 = m1Slider.value();
  let m2 = m2Slider.value();
  let distance = distSlider.value();

  let center = createVector(width / 2, height / 2);

  body1 = new Body(center.copy(), createVector(0, 0), 20, m1, color(255, 150, 0));
  let pos2 = createVector(center.x + distance, center.y);

  // Stable orbit
  let speed = sqrt((G * m1) / distance);
  let vel2 = createVector(0, -speed);
  body2 = new Body(pos2, vel2, 10, m2, color(0, 150, 255));

  trails1 = [];
  trails2 = [];
}

function draw() {
  background(0);

  G = gSlider.value();
  let drag = dragSlider.value();

  body1.mass = m1Slider.value();
  body2.mass = m2Slider.value();

  let force = body1.attract(body2, G);
  body2.applyForce(force);

  // Apply drag
  let dragForce1 = p5.Vector.mult(body1.vel, -drag);
  let dragForce2 = p5.Vector.mult(body2.vel, -drag);
  body1.applyForce(dragForce1);
  body2.applyForce(dragForce2);

  body1.update(); // Optional: make both dynamic
  body2.update();

  trails1.push(body1.pos.copy());
  trails2.push(body2.pos.copy());

  drawTrails(trails1, body1.col);
  drawTrails(trails2, body2.col);

  body1.show();
  body2.show();
}

function drawTrails(trail, col) {
  noFill();
  stroke(col);
  beginShape();
  for (let p of trail) {
    vertex(p.x, p.y);
  }
  endShape();
}

class Body {
  constructor(pos, vel, r, mass, col) {
    this.pos = pos;
    this.vel = vel;
    this.acc = createVector(0, 0);
    this.r = r;
    this.mass = mass;
    this.col = col;
  }

  applyForce(f) {
    let a = p5.Vector.div(f, this.mass);
    this.acc.add(a);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  attract(other, G) {
    let force = p5.Vector.sub(this.pos, other.pos);
    let distance = constrain(force.mag(), 5, 500);
    force.normalize();
    let strength = (G * this.mass * other.mass) / (distance * distance);
    force.mult(strength);
    return force;
  }

  show() {
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}
