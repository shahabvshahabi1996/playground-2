/**
 * jQuery Playground
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */

// Variable to hold the content of the homepage
var home_content;

// Variable for Leaflet map
var map_content;

// Interval ID
var interval = null;

/**
 * Initialise page, calling function depending on URL hash value
 */
function init_page() {

  if (interval) {
    console.log(interval);
    clearInterval(interval);
    interval = null;
  }

  var hash = window.location.hash.substring(1);
  if (hash.toString() in window) {
    window[hash]();
  }
  else
    homepage();
}

/**
 * Initialise view ready to start drawing elements.
 * Returns jQuery div with id view.

 * @return  {HTMLElement}
 */
function init_view() {

    var view;

    view = $('#view');
    home_content = home_content || view.html();

    view.empty();
    view.css({
        width: '100%',
        height: Math.floor($(window).height() - $('header').height()) - 6,
        margin: 0,
        padding: 0
    });

    return view;
}

/**
 * Reset view height
 */
function window_resize() {

    var view, map;

    view = $('#view');
    view.css({
        width: $(window).width(),
        height: ($(window).height() - $('header').height())
    });
    map = $('#map');
    if (map.length > 0) {
        map.css({
            width: view.width(),
            height: view.height()
        });
    }
}

/**
 * Show main menu
 */
function show_menu() {

    var icon, items;

    icon = $('#menu-icon');
    items = $('#menu-items');
    if (!items.is(':visible')) {
        icon.addClass('active');
        items.css({
            'padding-top': $('header').height()
        });
        items.animate({ width: 'show' }, 'slow');
    }
    else {
        items.animate({ width: 'hide' }, 'slow');
        icon.removeClass('active');
    }
}

/**
 * Create an absolutely positioned div element
 *
 * @param   {Number}    left    Coordinate of the left edge
 * @param   {Number}    top     Coordinate of the top edge
 * @param   {Number}    width   Width of element
 * @param   {Number}    height  Height of element
 * @param   {String}    id      ID of the div
 * @param   {String}    classes Classes for the div
 * @return  {HTMLElement}
 */
function make_div(left, top, width, height, id, classes) {

    var div;

    id = id || '';
    classes = classes || '';

    div = $('<div>', {
        id: id,
        class: classes
    });
    div.css({
        left: left+'px',
        top: top+'px',
        width: width + 'px',
        height: height + 'px'
    });

    return div;
}

/**
 * Restore homepage content
 */
function homepage() {

    var view;

    view = init_view();
    view.html(home_content);
}


/**
 * Draw canvas
 */
function swarm() {

  var view;

  view = init_view();
  $('<canvas>').attr({
    id: 'swarm',
    width: view.width(),
    height: view.height()
  }).appendTo(view);

  LazyLoad.js('js/swarm.js');
}

/**
 * Draw Circles
 */
function circles() {

    var view, circle, count, scale, step, size, x, y, colour;

    count = 100;
    view = init_view();
    if (view.width() < view.height())
        scale = view.width();

    else
        scale = view.height();
    step = scale / Math.log(count+1);

    for (var i = 0; i < count; i++) {
        size = Math.floor(step * Math.random());
        x = Math.floor((Math.random() * (view.width() - size)));
        y = Math.floor((Math.random() * (view.height() - size)));
        colour = Math.floor(360 * Math.random() +1);
        circle = make_div(x, y, size, size, 'circle'+i, 'circle');
        circle.css({
            'background-color': 'hsl('+colour+', 100%, 75%)',
            'border': '1px solid hsl('+colour+', 50%, 75%)'
        });
        view.append(circle);
    }
}

/**
 * Draw Spiral
 *
 * @param   {Number}    decay   Decay ratio for the spiral
 * @param   {Number}    depth   Number of rotations to drawe
 */
function spiral(decay, depth) {

    var view, arc, top, left, size;

    view = init_view();
    decay = Number(decay) || 1.62;
    depth = Number(depth) || 4;
    top = 10;
    left = 10;

    if (view.width() < decay * view.height())
        size = ((view.width() * decay) / (1 + decay)) - 10;
    else {
        size = ((view.height() * decay * decay) / (1 +  decay)) - 20;
    }

    for (var i = 0; i < depth; i++) {

        // Top-left
        arc = make_div(left, top, size, size, 'spiral-tl-'+i, 'arc arc-top-left');
        arc.appendTo(view);

        // Top-right
        left += size;
        size /= decay;
        arc = make_div(left, top, size, size, 'spiral-tr-'+i, 'arc arc-top-right');
        arc.appendTo(view);

        // Bottom-right
        top += size;
        left += size - (size / decay);
        size /= decay;
        arc = make_div(left, top, size, size, 'spiral-br-'+i, 'arc arc-bottom-right');
        arc.appendTo(view);

        // Bottom-left
        top += size - (size / decay);
        size /= decay;
        left -= size;
        arc = make_div(left, top, size, size, 'spiral-bl-'+i, 'arc arc-bottom-left');
        arc.appendTo(view);

        // Top-left
        size /= decay;
        top -= size;

        // No need to continue if size is less than a pixel
        if (size < 0)
            break;
    }

    // Attach slider controls
    view.append('<div class="controls">' +
          'Decay: 1 <input type="range" min="1" max="2" value="'+decay+'" step="0.01" name="decay" id="decay" onchange="spiral($(this).val(), '+depth+');" /> 2 <span class="value">('+decay+')</span><br />' +
          'Depth: 1 <input type="range" min="1" max="40" value="'+depth+'" step="1" name="depth" id="depth" onchange="spiral('+decay+', $(this).val());" /> 40 <span class="value">('+depth+')</span><br />' +
        '</div>');
}

/**
 * Bouncing balls
 */
function bouncing_balls() {

    var view, ball, balls;

    view = init_view();
    /*ball = {
        x = Math.floor((Math.random() * (view.width() - size))),
        y = Math.floor((Math.random() * (view.height() - size))),
        colour: 'hsl('+Math.floor(360 * Math.random() +1)+', 100%, 75%)'

    }*/

}

/**
 * Load Leaflet files
 */
function leaflet() {

    if (!map_content) {
        // Load leaflet CSS and JS files
        LazyLoad.css([
            'css/leaflet.css',
            'css/leaflet-locatecontrol/L.Control.Locate.css'
        ]);
        LazyLoad.js([
            'js/vendor/leaflet.js',
            'js/vendor/L.Control.Locate.js',
            'js/leaflet-maps.js'
        ], display_leaflet);
    }
    else {
        var view;
        view = init_view();
        view.append(map_content);
    }
}

/**
 * Display Leaflet map
 */
function display_leaflet() {

    var view, map;

    view = init_view();
    map_content = make_div(0, 0, view.width(), view.height(), 'map');
    view.append(map_content);

    map = L.map('map');
    L.control.layers(maps, overlays).addTo(map);
    L.control.scale().addTo(map);
    var lc = L.control.locate({
        follow: true,
        stopFollowingOnDrag: true,
        onLocationError: function(e) {  }
    }).addTo(map);

    // Load map and position
    if (!map.restoreView()) {
        map.addLayer(osm);
        map.locate({
            setView: true,
            maxZoom: 14
        });
    }
}
