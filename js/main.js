/**
 * jQuery Playground
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */

// Variable to hold the content of the homepage
var home_content;

// Variable for Leaflet map
var map_content;

/**
 * Initialise view ready to start drawing elements.
 * Returns jQuery div with id view.
 */
function init_view() {

    var view;

    view = $('#view');
    home_content = home_content || view.html();

    view.empty();
    view.css({
        width: '100%',
        height: ($(window).height() - $('header').height()) + 'px',
        margin: 0
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
        height: ($(window).height() - $('header').height()) + 'px'
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
        items.animate({ width: 'toggle' }, 'slow');
    }
    else {
        items.animate({ width: 'toggle' }, 'slow');
        icon.removeClass('active');
    }
}

/**
 * Create a div element
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
 */
function spiral(ratio) {

    var view, arc, top, left, scale;

    ratio = ratio || 1.618;
    view = init_view();
    top = 10;
    left = 10;
    if (view.width() < view.height())
        scale = (view.width() / ratio) - 20;
    else
        scale = view.height() - 20;

    for (var i = 0; i < 4; i++) {

        // Top-left
        arc = make_div(left, top, scale, scale, 'spiral-tl-'+i, 'arc arc-top-left');
        arc.appendTo(view);

        // Top-right
        left += scale;
        scale /= ratio;
        arc = make_div(left, top, scale, scale, 'spiral-tr-'+i, 'arc arc-top-right');
        arc.appendTo(view);

        // Bottom-right
        top += scale;
        left += scale - (scale / ratio);
        scale /= ratio;
        arc = make_div(left, top, scale, scale, 'spiral-br-'+i, 'arc arc-bottom-right');
        arc.appendTo(view);

        // Bottom-left
        top += scale - (scale / ratio);
        scale /= ratio;
        left -= scale;
        arc = make_div(left, top, scale, scale, 'spiral-bl-'+i, 'arc arc-bottom-left');
        arc.appendTo(view);

        // Top-left
        scale /= ratio;
        top -= scale;
    }
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
