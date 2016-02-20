/**
 * Swarm animation
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */


var COUNT = 50;
var RADIUS = 4;
var SPEED = 1;
var MASS = 500;

// Swarm effect boundaries
var MULTIPLIER = 2;
var INNER_BOUNDARY = 100;
var OUTER_BOUNDARY = 500;

/**
 * Swarm animation object
 */
function Swarm() {

  // Canvas and Window objects
  this.canvas = $('#swarm');
  this.context = this.canvas[0].getContext("2d");

  // Swarm members
  this.members = [];
  for (var i = 0; i < COUNT; i++) {
    this.members.push(new Swarmer(this, i, RADIUS, SPEED, MASS));
  }

  // Mouse position
  this.mouse_x = -1;
  this.mouse_y = -1;
  this.canvas.mousemove(function(event) {
    this.mouse_x = event.pageX;
    this.mouse_y = event.pageY;
  }.bind(this));
  this.canvas.mouseleave(function() {
    this.mouse_x = -1;
    this.mouse_y = -1;
  }.bind(this));
}

/**
 * Animate the swarm
 */
Swarm.prototype.run = function() {

  this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
  for (var i = 0; i < COUNT; i++) {
    this.members[i].move();
    this.members[i].draw();
  }
};


/**
 * Swarmer object
 */
function Swarmer(swarm, id, radius, speed, mass) {

  this.swarm = swarm;
  this.id = id;
  this.radius = radius;
  this.speed = speed;
  this.speed2 = speed * speed;
  this.mass = mass;
  this.moment = 1 / mass;

  // Location and velocity
  this.x = radius + Math.random() * (this.swarm.canvas.width() - radius);
  this.y = radius + Math.random() * (this.swarm.canvas.height() -  radius);
  var direction = 2*Math.PI * Math.random();
  this.dx = speed * Math.cos(direction);
  this.dy = speed * Math.sin(direction);
}

/**
 * Draw swarmer
 */
Swarmer.prototype.draw = function() {

  this.swarm.context.beginPath();
  this.swarm.context.arc(this.x , this.y, this.radius, 0, 2*Math.PI, true);
  this.swarm.context.closePath();
  this.swarm.context.fill();
  this.swarm.context.beginPath();
  this.swarm.context.moveTo(this.x, this.y);
  this.swarm.context.lineTo(this.x + 10 * this.dx, this.y + 10 * this.dy);
  this.swarm.context.stroke();
};

/**
 * Move swarmer
 */
Swarmer.prototype.move = function() {

  var ddx = [];
  var ddy = [];

  // Move towards mouse if on screen
  if (this.swarm.mouse_x != -1 && this.mouse_y != -1) {
    var vx = this.swarm.mouse_x - this.x;
    var vy = this.swarm.mouse_y - this.y;
    var normaliser = this.speed / Math.sqrt(vx * vx + vy * vy);
    ddx.push(MULTIPLIER * normaliser * vx);
    ddy.push(MULTIPLIER * normaliser * vy);
  }

  // Adjust speed if slow
  var speed2 = this.dx * this.dx + this.dy * this.dy;
  if (speed2 < this.speed2) {
    ddx.push((1 + this.moment) * this.dx);
    ddy.push((1 + this.moment) * this.dy);
  }

  // Calculate force from other swarm members
  for (var i = 0; i < this.swarm.members.length; i++) {
    if (this.id != i) {
      var effect = this.swarm_effect(this.swarm.members[i]);
      ddx.push(effect[0]);
      ddy.push(effect[1]);
    }
  }

  // Sum arrays of effects
  var add = function(a, b) { return a + b; };
  var total_ddx = ddx.reduce(add);
  var total_ddy = ddy.reduce(add);

  // Calculate effect
  this.dx = (1 - this.moment) * this.dx + this.moment * total_ddx;
  this.dy = (1 - this.moment) * this.dy + this.moment * total_ddy;

  // Bounce off sides
  if (Math.round(this.x + this.dx + this.radius) > this.swarm.canvas.width()
    || Math.round(this.x + this.dx - this.radius) < 0) {
    this.dx = -1 * this.dx;
  }
  if (Math.round(this.y + this.dy + this.radius)  > this.swarm.canvas.height()
    || Math.round(this.y + this.dy - this.radius) < 0) {
    this.dy = -1 * this.dy;
  }

  // Move
  this.x += this.dx;
  this.y += this.dy;
};

/**
 * Calculate effect from another swarmer
 */
Swarmer.prototype.swarm_effect = function(other) {

  var ox = other.x - this.x;
  var oy = other.y - this.y;
  var distance = Math.sqrt(ox * ox + oy * oy);
  var effect;

  // Calculate magnitude of effect
  if (distance < INNER_BOUNDARY) {
    effect = -10 * MULTIPLIER * (INNER_BOUNDARY - distance) / INNER_BOUNDARY;
  }
  else if (distance > INNER_BOUNDARY && distance < OUTER_BOUNDARY) {
    effect = MULTIPLIER * (OUTER_BOUNDARY - distance) / OUTER_BOUNDARY;
  }
  else {
    return [0, 0];
  }

  // Return effect vector
  var normaliser = this.speed / distance;
  ox = effect * normaliser * ox;
  oy = effect * normaliser * oy;
  return [ox, oy];
};

/**
 * Swarm leader object
 */
function SwarmLeader(radius, speed) {

  this.canvas = $('#swarm');
  this.context = this.canvas[0].getContext("2d");

  this.radius = radius;
  this.speed = speed;

  // Location and velocity
  this.x = radius + Math.random() * (this.canvas.width() - radius);
  this.y = radius + Math.random() * (this.canvas.height() -  radius);
  var direction = 2*Math.PI * Math.random();
  this.dx = speed * Math.cos(direction);
  this.dy = speed * Math.sin(direction);

  // Mouse position
  this.mouse_x = -1;
  this.mouse_y = -1;
  this.canvas.mousemove(function(event) {
    this.mouse_x = event.pageX;
    this.mouse_y = event.pageY;
  }.bind(this));
  this.canvas.mouseleave(function() {
    this.mouse_x = -1;
    this.mouse_y = -1;
  }.bind(this));
}

/**
 * SwarmLeader inherits from Swarmer
 */
SwarmLeader.prototype = Object.create(Swarmer.prototype);

/**
 * Move swarm leader
 */
SwarmLeader.prototype.move = function() {

  if (this.mouse_x != -1 && this.mouse_y != -1) {
    var vx = this.mouse_x - this.x;
    var vy = this.mouse_y - this.y;
    var normaliser = this.speed / Math.sqrt(vx * vx + vy * vy);
    this.dx = 0.995 * this.dx + 0.006 * vx * normaliser;
    this.dy = 0.995 * this.dy + 0.006 * vy * normaliser;
  }

  if (Math.round(this.x + this.dx + this.radius) > this.canvas.width()
      || Math.round(this.x + this.dx - this.radius) < 0) {
    this.dx = -1 * this.dx;
  }
  if (Math.round(this.y + this.dy + this.radius)  > this.canvas.height()
      || Math.round(this.y + this.dy - this.radius) < 0) {
    this.dy = -1 * this.dy;
  }

  this.x += this.dx;
  this.y += this.dy;
};


// Run the swarm
var animation = new Swarm();
interval = setInterval(function () {
  animation.run();
}, 10);