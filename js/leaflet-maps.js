/**
 * Leaflet Customisations
 *
 * @author  Stephen Cox <mail@stephencox.net>
 */

/**
 * Restore view when reloading the page
 * Adapted from https://github.com/makinacorpus/Leaflet.RestoreView
 */
var RestoreViewMixin = {
    restoreView: function () {
        var storage = window.localStorage || {};
        if (!this.__initRestore) {
            this['overlays'] = Array();
            // Set location data
            this.on('moveend', function (e) {
                if (!this._loaded)
                    return;
                var view = {
                    lat: this.getCenter().lat,
                    lng: this.getCenter().lng,
                    zoom: this.getZoom()
                };
                storage['mapView'] = JSON.stringify(view);
            }, this);
            // Set base layer
            this.on('baselayerchange', function (e) {
                if (!e)
                    return;
                var layer = e['name'];
                storage['layer'] = JSON.stringify(layer);
            }, this);
            // Set an overlay
            this.on('overlayadd', function (e) {
                if (!e)
                    return;
                this['overlays'].push(e['name']);
                storage['overlays'] = JSON.stringify(this['overlays']);
            }, this);
            // Remove an overlay
            this.on('overlayremove', function (e) {
                if (!e)
                    return;
                var i = this['overlays'].indexOf(e['name']);
                if (i > -1)
                    this['overlays'].splice(i , 1);
                storage['overlays'] = JSON.stringify(this['overlays']);
            }, this);
            this.__initRestore = true;
        }
        var view = storage['mapView'];
        var layer = storage['layer'];
        var extras = storage['overlays'];
        try {
            view = JSON.parse(view || '');
            this.setView(L.latLng(view.lat, view.lng), view.zoom, true);
            layer = JSON.parse(layer || '');
            this.addLayer(maps[layer]);
            if (extras) {
                extras = JSON.parse(extras || '');
                for (var i = 0; i < extras.length; i++)
                    this.addLayer(overlays[extras[i]], false);
            }
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
};
L.Map.include(RestoreViewMixin);


/**
 * Main mapping code
 */

// OpenStreetMap
var osm_attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0
});

// Thunderforest
var ocm = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0
});
var tf_transport = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0
});
var tf_landscape = L.tileLayer('http://{s}.tile3.opencyclemap.org/landscape/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0
});
var tf_outdoors = L.tileLayer('http://{s}.tile.opencyclemap.org/outdoors/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0
});

// Google Maps
var google_attribution = '&copy; <a href="http://maps.google.com/">Google</a>';
var google_earth = L.tileLayer('https://khms{s}.google.co.uk/kh/v=138&src=app&x={x}&y={y}&z={z}', {
    attribution: google_attribution,
    subdomains: '0123',
    maxZoom: 20,
    minZoom: 0
});

var google_overlay = L.tileLayer('https://mts{s}.google.com/vt/lyrs=h&hl=en&src=app&x={x}&y={y}&z={z}', {
    attribution: google_attribution,
    subdomains: '0123',
    maxZoom: 19,
    minZoom: 0
});
var google_maps = L.tileLayer('https://mts{s}.google.com/vt/lyrs=m&hl=en&src=app&x={x}&y={y}&z={z}', {
    attribution: google_attribution,
    subdomains: '0123',
    maxZoom: 19,
    minZoom: 0
});
var google_terrain = L.tileLayer('https://mt{s}.google.com/vt/lyrs=t,r&hl=en&x={x}&y={y}&z={z}', {
    attribution: google_attribution,
    subdomains: '0123',
    maxZoom: 15,
    minZoom: 0
});

// Microsoft Maps
var BingLayer = L.TileLayer.extend({
    getTileUrl: function (tilePoint) {
        this._adjustTilePoint(tilePoint);
        return L.Util.template(this._url, {
            s: this._getSubdomain(tilePoint),
            q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
        });
    },
    _quadKey: function (x, y, z) {
        var quadKey = [];
        for (var i = z; i > 0; i--) {
            var digit = '0';
            var mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadKey.push(digit);
        }
        return quadKey.join('');
    }
});
var ms_attribution = '&copy; <a href="http://bing.com/maps">Bing Maps</a>';
var ms_earth = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/a{q}.png?g=1398', {
    subdomains: '01234',
    attribution: ms_attribution,
    maxZoom: 19,
    minZoom: 1
});
var ms_maps = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/r{q}.png?g=1398', {
    subdomains: '01234',
    attribution: ms_attribution,
    maxZoom: 19,
    minZoom: 0
});
var ms_hybrid = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/h{q}.png?g=1398', {
    subdomains: '01234',
    attribution: ms_attribution,
    maxZoom: 19,
    minZoom: 1
});

// Ordance Survey
var os = new BingLayer('http://ecn.t{s}.tiles.virtualearth.net/tiles/r{q}.png?g=41&productSet=mmOS', {
    subdomains: '01234',
    attribution: ms_attribution,
    maxZoom: 16,
    minZoom: 12
});

// Overlays
var contours = L.tileLayer('http://129.206.74.245:8006/tms_il.ashx?x={x}&y={y}&z={z}', {
    attribution: 'Contours &copy; <a href="http://srtm.csi.cgiar.org/">SRTM</a>',
    maxZoom: 17,
    minZoom: 13,
    opacity: 0.8
});
var hill_shade = L.tileLayer('http://tiles2.openpistemap.org/landshaded/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 0,
    opacity: 0.8
});
var pistes = L.tileLayer('http://tiles.openpistemap.org/nocontours/{z}/{x}/{y}.png', {
    attribution: osm_attribution,
    maxZoom: 18,
    minZoom: 8
});

// Maps
var maps = {
    'OpenStreetMap': osm,
    'OpenCycleMap': ocm,
    'Thunderforest Transport': tf_transport,
    'Thunderforest Landscape': tf_landscape,
    'Thunderforest Outdoors': tf_outdoors,
    'Google Earth': google_earth,
    'Google Maps': google_maps,
    'Google Terrain': google_terrain,
    'Microsoft Earth': ms_earth,
    'Microsoft Maps': ms_maps,
    'Microsoft Hybrid': ms_hybrid,
//    'Ordanance Survey': os,
};
var overlays = {
    'Contours': contours,
    'Hill Shading': hill_shade,
    'Google Maps': google_overlay,
    'Pistes': pistes
};

