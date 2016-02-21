/**
 * Swarm animation
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */


/**
 * Swarm animation object
 */
function Swarm() {

  // Canvas and Window objects
  this.canvas = $('#swarm');
  this.context = this.canvas[0].getContext("2d");

  // Configuration object
  this.config = new SwarmConfig();
  this.config.update();

  // Create swarmers
  this.members = [];
  for (var i = 0; i < this.config.count; i++) {
    this.members.push(new Swarmer(this, i));
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
  for (var i = 0; i < this.members.length; i++) {
    this.members[i].move();
    this.members[i].draw();
  }
};

/**
 * Start the swarm
 */
Swarm.prototype.start = function() {

  // Start the animation
  interval = setInterval(function () {
    this.run();
  }.bind(this), 10);
};

/**
 * Stop the swarm
 */
Swarm.prototype.stop = function() {

  clearInterval(interval);
};

/**
 * Reset the swarm
 */
Swarm.prototype.reset = function() {

  this.stop();

  // Update the configuration
  this.config.update();

  // Create swarmers
  this.members = [];
  for (var i = 0; i < this.config.count; i++) {
    this.members.push(new Swarmer(this, i));
  }

  this.start();
};

/**
 * Swarmer object
 */
function Swarmer(swarm, id) {

  this.swarm = swarm;
  this.id = id;

  this.algo = this.swarm.config.algo;
  this.mass = this.swarm.config.mass;
  this.moment = 1 / this.mass;
  this.radius = this.swarm.config.radius;
  this.speed = this.swarm.config.speed;
  this.speed2 = this.speed * this.speed;

  this.colour = '#000000';

  // Location and velocity
  this.x = this.radius + Math.random() * (this.swarm.canvas.width() - this.radius);
  this.y = this.radius + Math.random() * (this.swarm.canvas.height() -  this.radius);
  var direction = 2*Math.PI * Math.random();
  this.dx = this.speed * Math.cos(direction);
  this.dy = this.speed * Math.sin(direction);
}

/**
 * Draw swarmer
 */
Swarmer.prototype.draw = function() {

  this.swarm.context.fillStyle = this.colour;
  this.swarm.context.beginPath();
  this.swarm.context.arc(this.x , this.y, this.radius, 0, 2*Math.PI, true);
  this.swarm.context.closePath();
  this.swarm.context.fill();
  if (this.swarm.config.show_direction) {
    this.swarm.context.beginPath();
    this.swarm.context.moveTo(this.x, this.y);
    this.swarm.context.lineTo(this.x + 10 * this.dx, this.y + 10 * this.dy);
    this.swarm.context.stroke();
  }
};

/**
 * Move swarmer
 */
Swarmer.prototype.move = function() {

  var ddx = [];
  var ddy = [];

  // Move towards mouse if on screen
  if (this.swarm.config.follow_mouse) {
    if (this.swarm.mouse_x != -1 && this.swarm.mouse_y != -1) {
      var vx = this.swarm.mouse_x - this.x;
      var vy = this.swarm.mouse_y - this.y;
      var normaliser = this.speed / Math.sqrt(vx * vx + vy * vy);
      ddx.push(this.swarm.config.mouse_force * normaliser * vx);
      ddy.push(this.swarm.config.mouse_force * normaliser * vy);
    }
  }

  // Adjust speed if slow
  if (this.swarm.config.speed_up) {
    var speed2 = this.dx * this.dx + this.dy * this.dy;
    if (speed2 < this.speed2) {
      ddx.push((1 + this.moment) * this.dx);
      ddy.push((1 + this.moment) * this.dy);
    }
  }

  // Calculate force from other swarm members
  this.colour = '#000000';
  for (var i = 0; i < this.swarm.members.length; i++) {
    if (this.id != this.swarm.members[i].id) {
      var effect = this.swarm_effect(this.swarm.members[i]);
      ddx.push(effect[0]);
      ddy.push(effect[1]);
    }
  }

  // Sum arrays of effects
  var add = function(a, b) { return a + b; };
  var total_ddx = ddx.reduce(add);
  var total_ddy = ddy.reduce(add);

  // Apply effect
  if (this.swarm.config.dampen) {
    this.dx = (1 - this.moment) * this.dx + this.moment * total_ddx;
    this.dy = (1 - this.moment) * this.dy + this.moment * total_ddy;
  }
  else {
    this.dx = this.dx + this.moment * total_ddx;
    this.dy = this.dy + this.moment * total_ddy;
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
 * Calculate effect from another swarmer
 */
Swarmer.prototype.swarm_effect = function(other) {

  // Return empty if no algorithm
  if (this.algo == 'none') {
    return [0, 0];
  }

  var ox = other.x - this.x;
  var oy = other.y - this.y;
  var distance = Math.sqrt(ox * ox + oy * oy);
  var effect = null;
  var repel_boundary, attract_boundary;

  // Calculate effect for constant algorithm
  if (this.algo == 'constant') {

    repel_boundary = this.swarm.config.repel_boundary;
    attract_boundary = this.swarm.config.attract_boundary;

    if (distance < repel_boundary) {
      effect = this.swarm.config.repel_force;
    }
    else if (distance > repel_boundary && distance <  attract_boundary) {
      effect = this.swarm.config.attract_force;
    }
  }

  // Calculate effect for linear algorithm
  if (this.algo == 'linear') {

    repel_boundary = this.swarm.config.repel_boundary;
    attract_boundary = this.swarm.config.attract_boundary;

    if (distance < repel_boundary) {
      effect = this.swarm.config.repel_force * (repel_boundary - distance) / repel_boundary;
    }
    else if (distance > repel_boundary && distance <  attract_boundary) {
      effect = this.swarm.config.attract_force * (attract_boundary - distance) /  attract_boundary;
    }
  }

  // Return empty if no effect
  if (!effect) {
    return [0, 0];
  }

  // Set colour if contact
  if (distance <= this.radius) {
    this.colour = '#FF0000';
  }

  // Return effect vector
  var normaliser = this.speed / distance;
  ox = effect * normaliser * ox;
  oy = effect * normaliser * oy;
  return [ox, oy];
};


/**
 * SwarmConfig object
 */
SwarmConfig = function() {

  // Swarm settings
  this.count = 50;
  this.radius = 4;
  this.speed = 2.0;
  this.mass = 100;

  // Display settings
  this.show_direction = true;

  // Mouse settings
  this.follow_mouse = true;
  this.mouse_force = 1;

  // Acceleration settings
  this.dampen = true;
  this.speed_up = false;

  // Algorithm
  this.algos = [
    'none',
    'constant',
    'linear'
  ];
  this.algo = 'linear';

  // Algorithm settings
  this.repel_boundary = 100;
  this.attract_boundary = 400;
  this.repel_force = -10;
  this.attract_force = 1;

  // Add the control panel to the page
  this.draw();
};

/**
 * Get latest config from control panel
 */
SwarmConfig.prototype.update = function() {

  this.count =  parseInt($('#count').val());
  this.radius = parseInt($('#radius').val());
  this.speed = parseFloat($('#speed').val());
  this.mass = parseFloat($('#mass').val());

  this.algo = $('#algo').val();
  this.repel_boundary = parseInt($('#repel_boundary').val());
  this.attract_boundary = parseInt($('#attract_boundary').val());
  this.repel_force = parseInt($('#repel_force').val());
  this.attract_force = parseInt($('#attract_force').val());

  this.show_direction = $('#show_direction').prop("checked");

  this.follow_mouse = $('#follow_mouse').prop("checked");
  this.mouse_force = parseFloat($('#mouse_force').val());

  this.dampen = $('#dampen').prop("checked");
  this.speed_up = $('#speed_up').prop("checked");
};

/**
 * Draw SwarmerConfig control panel
 */
SwarmConfig.prototype.draw = function() {

  var control_panel = ' \
<div id="swarm-control" style="position: absolute; top: 10px; left: 10px"> \
  <fieldset class="swarm-controls">\
    <label>Swarm controls</label> \
    <div class="control range"> \
      <span class="name">Count:</span> \
      <input class="value" id="count" type="text" value="'+this.count+'" size="3" />\
      <span c1ass="input"><span class="min-max">1</span><input type="range" min="1" max="200" value="'+this.count+'" oninput="$(\'#count\').val(this.value);" /><span class="min-max">200</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Radius:</span> \
      <input class="value" id="radius" type="text" value="'+this.radius+'" size="3" />\
      <span c1ass="input"><span class="min-max">1</span><input type="range" min="1" max="10" value="'+this.radius+'" oninput="$(\'#radius\').val(this.value);" /><span class="min-max">10</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Speed:</span> \
      <input class="value" id="speed" type="text" value="'+this.speed+'" size="3" />\
      <span c1ass="input"><span class="min-max">0</span><input type="range" min="0" max="10" step="0.1" value="'+this.speed+'" oninput="$(\'#speed\').val(this.value);" /><span class="min-max">10</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Mass:</span> \
      <input class="value" id="mass" type="text" value="'+this.mass+'" size="3" />\
      <span c1ass="input"><span class="min-max">1</span><input type="range" min="1" max="1000" step="1" value="'+this.mass+'" oninput="$(\'#mass\').val(this.value);" /><span class="min-max">1000</span></span> \
    </div> \
  </fieldset> \
  <fieldset class="algorithm"> \
    <label>Algorithm settings</label> \
    <div class="control"> \
      <span class="name">Swarm algorithm:</span> \
      <select class="value" id="algo"> \
        <option value="none"'+(this.algo == 'none' ? ' selected' : '')+'>None</option>\
        <option value="constant"'+(this.algo == 'constant' ? ' selected' : '')+'>Constant</option>\
        <option value="linear"'+(this.algo == 'linear' ? ' selected' : '')+'>Linear</option>\
      </select> \
    </div>\
    <div class="control range"> \
      <span class="name">Repulsion radius:</span> \
      <input class="value" id="repel_boundary" type="text" value="'+this.repel_boundary+'" size="3" />\
      <span c1ass="input"><span class="min-max">1</span><input type="range" min="1" max="500" step="1" value="'+this.repel_boundary+'" oninput="$(\'#repel_boundary\').val(this.value);" /><span class="min-max">500</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Attraction radius:</span> \
      <input class="value" id="attract_boundary" type="text" value="'+this.attract_boundary+'" size="3" />\
      <span c1ass="input"><span class="min-max">1</span><input type="range" min="1" max="1000" step="1" value="'+this.attract_boundary+'" oninput="$(\'#attract_boundary\').val(this.value);" /><span class="min-max">1000</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Repulsion value:</span> \
      <input class="value" id="repel_force" type="text" value="'+this.repel_force+'" size="3" />\
      <span c1ass="input"><span class="min-max">-40</span><input type="range" min="-40" max="0" step="-0.1" value="'+this.repel_force+'" oninput="$(\'#repel_force\').val(this.value);" /><span class="min-max">0</span></span> \
    </div> \
    <div class="control range"> \
      <span class="name">Attraction value:</span> \
      <input class="value" id="attract_force" type="text" value="'+this.attract_force+'" size="3" />\
      <span c1ass="input"><span class="min-max">0</span><input type="range" min="0" max="10" step="0.1" value="'+this.attract_force+'" oninput="$(\'#attract_force\').val(this.value);" /><span class="min-max">10</span></span> \
    </div> \
  </fieldset> \
  <fieldset class="acceleration"> \
    <label>Acceleration settings</label> \
    <div class="control"> \
      <span class="name">Dampen (add resistance):</span> \
      <input class="value" id="dampen" type="checkbox" value="1"'+(this.dampen ? ' checked' : '')+' />\
    </div> \
    <div class="control"> \
      <span class="name">Speed up slow members:</span> \
      <input class="value" id="speed_up" type="checkbox" value="1"'+(this.speed_up ? ' checked' : '')+' />\
    </div> \
  </fieldset> \
  <fieldset class="display"> \
    <label>Display settings</label> \
    <div class="control"> \
      <span class="name">Display velocity vector:</span> \
      <input class="value" id="show_direction" type="checkbox" value="1"'+(this.show_direction ? ' checked' : '')+' />\
    </div> \
  </fieldset> \
  <fieldset class="mouse"> \
    <label>Mouse settings</label> \
    <div class="control"> \
      <span class="name">Follow mouse:</span> \
      <input class="value" id="follow_mouse" type="checkbox" value="1"'+(this.follow_mouse ? ' checked' : '')+' />\
    </div> \
    <div class="control range"> \
      <span class="name">Mouse attraction:</span> \
      <input class="value" id="mouse_force" type="text" value="'+this.mouse_force+'" size="3" />\
      <span c1ass="input"><span class="min-max">0</span><input type="range" min="0" max="10" step="0.1" value="'+this.mouse_force+'" oninput="$(\'#mouse_force\').val(this.value);" /><span class="min-max">10</span></span> \
    </div> \
  </fieldset> \
  <div class="stop-start"> \
    <input type="button" id="swarm-start" value="Start" onclick="animation.start();" /> \
    <input type="button" id="swarm-sop" value="Stop" onclick="animation.stop();" /> \
    <input type="button" id="swarm-reset" value="Restart" onclick="animation.reset();" /> \
  </div>\
</div>';

  $('#view').append(control_panel);
};


// Swarm control functions
animation = new Swarm();
animation.start();
