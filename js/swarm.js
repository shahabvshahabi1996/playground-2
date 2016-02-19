/**
 * Swarm animation
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */

var RADIUS = 4;
var SPEED = 1;
var COUNT = 10;


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
    this.members.push(new Swarmer(this, RADIUS, SPEED));
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
function Swarmer(swarm, radius, speed) {

  this.swarm = swarm;
  this.radius = radius;
  this.speed = speed;

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
  this.swarm.context.arc(Math.round(this.x) , Math.round(this.y), this.radius, 0, 2*Math.PI, true);
  this.swarm.context.closePath();
  this.swarm.context.fill();
};

/**
 * Move swarmer
 */
Swarmer.prototype.move = function() {

  // Move towards mouse if on screen
  if (this.swarm.mouse_x != -1 && this.mouse_y != -1) {
    var vx = this.swarm.mouse_x - this.x;
    var vy = this.swarm.mouse_y - this.y;
    var normaliser = this.speed / Math.sqrt(vx * vx + vy * vy);
    this.dx = 0.999 * this.dx + 0.001 * vx * normaliser;
    this.dy = 0.999 * this.dy + 0.001 * vy * normaliser;
  }

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
}, 1);