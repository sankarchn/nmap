/**
 * Created by Sankar on 04-01-2017.
 */

var Gmap = (function () {
    'use strict';

    var map,
        markers = {},
        bounds,
        infoWindow,
        drawingManager,
        streetViewService,
        polygon = null,
        viewModel;

    /* Map style sourced from: https://snazzymaps.com/style/61/blue-essence
     *  Snazzy Maps is a repository of different styles for Google Maps aimed towards web designers and developers.
     *  All styles are licensed under creative commons and are completely free to use.
     */
    var mapStyle = [
        {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [{"visibility": "on"}, {"color": "#e0efef"}]
        },
        {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [{"visibility": "on"}, {"hue": "#1900ff"}, {"color": "#c0e8e8"}]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"lightness": 100}, {"visibility": "simplified"}]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{"visibility": "on"}, {"lightness": 700}]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#7dcdcd"}]
        }];

    function init(anchor, center, zlevel, vm) {

        map = new google.maps.Map(anchor, {
            center: center,
            zoom: zlevel,
            mapTypeControl: false,
            scaleControl: true,
            disableDoubleClickZoom: true,
            draggable: true,
            styles: mapStyle
        });

        markers = {};

        bounds = new google.maps.LatLngBounds();

        infoWindow = new google.maps.InfoWindow();
        // Make sure the marker icon is no longer highlighted when the infowindow is closed.
        infoWindow.addListener('closeclick', closeInfoWindow);

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
                drawingModes: ['polygon']
            }
        });
        drawingManager.setMap(map);
        // Add an event listener so that the polygon is captured,  call the
        // processPolygon function. This will show the markers in the polygon,
        // and hide any outside of it.
        drawingManager.addListener('overlaycomplete', processPolygon);

        // Using doubleclick to restore map when markers are
        // hidden because user drawing a polygon
        map.addListener('dblclick', restoreMap);

        streetViewService = new google.maps.StreetViewService();

        // When a marker is clicked on the map, we need to inform
        // list view to highlight the corresponding list item. so
        // we take in the view model object here.
        viewModel = vm;

        // when the browser resizes, keep the map centered.
        google.maps.event.addDomListener(window, "resize", function() {
            var center = bounds.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });
    }

    function addMarker(id) {
        var marker,
            spot;

        spot = spotsDb.getSpot(id);
        marker = new google.maps.Marker({
            position: spot.getPosition(),
            animation: google.maps.Animation.DROP,
            draggable: false,
            id: id,
            title: spot.getName()
        });
        marker.setIcon(getDefIcon());

        // Extend the boundaries of the map for each marker
        bounds.extend(marker.position);

        // Push the marker to our hash of markers.
        markers[id] = marker;

        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function () {
            this.setIcon(getHighlightIcon());
        });
        marker.addListener('mouseout', function () {
            // Do not stop highlighting if this marker is clicked
            // ie infowindow is open for this marker!
            if (infoWindow.marker != this)
                this.setIcon(getDefIcon());
        });
        marker.addListener('click', function () {
            // the id aka key is stored in marker
            showInfoWindow(this.id);
        });
    }

    function showAllMarkers() {
        var i = 1;

        // Assuming that bounds have been extended at the time of
        // adding the markers
        map.fitBounds(bounds);
        map.setCenter(bounds.getCenter());

        _.each(markers, function (marker) {
            window.setTimeout(function (mkr, where) {
                return function () {
                    mkr.setIcon(getDefIcon());
                    mkr.setMap(where);
                };
            }(marker, map), (i++) * 50);
        });
    }

    function showMarker(id) {
        if (_.has(markers, id))
            markers[id].setMap(map);
    }

    function hideMarker(id) {
        if (_.has(markers, id))
            markers[id].setMap(null);
    }

    function showInfoWindow(id) {
        var marker;

        if (!_.has(markers, id))
            return;

        marker = markers[id];
        // Stop highlighting the previous click's marker in the map
        // and inform the list view to do the same
        if (infoWindow.marker != null) {
            infoWindow.marker.setIcon(getDefIcon());
            viewModel.notify(MARKER_UNCLICKED, infoWindow.marker.id);
        }

        marker.setIcon(getHighlightIcon());
        infoWindow.marker = marker;
        infoWindow.setContent(getContent(id));
        infoWindow.open(map, marker);

        // Now, ask the list view to highlight this item
        viewModel.notify(MARKER_CLICKED, infoWindow.marker.id);
    }

    function closeInfoWindow() {
        infoWindow.setContent("");
        infoWindow.close();

        // The marker may be highligthed through list view click
        // or direct click on marker. We inform the list view
        // as the closure is triggered from the map
        if (infoWindow.marker != null) {
            infoWindow.marker.setIcon(getDefIcon());
            viewModel.notify(MARKER_UNCLICKED, infoWindow.marker.id);
            infoWindow.marker = null;
        }

        // recenter the map when infowindow is closed.
        map.setCenter(bounds.getCenter());
    }

    function getContent(id) {
        var spot = spotsDb.getSpot(id),
            marker = markers[id],
            radius = 100,
            ctemplate = _.template('<h2><%= title %></h2>' +
                '<h3><%= category %></h3><hr>' +
                '<h4><%= address %></h4><hr>' +
                '<h4>StreetView Image (Provider: Google)</h4>' +
                '<div <%= panoId %></div>'),
            contentStr = ctemplate({
                title: spot.getName(),
                category: spot.getCategory(),
                address: spot.getAddress().toString(),
                panoId: "id='pano'"
            });


        // Use streetview service to get the closest streetview image within
        // 100 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, function (data, status) {
            // In case the status is OK, which means the pano was found, compute the
            // position of the streetview image, then calculate the heading, then get a
            // panorama from that and set the options
            // console.log(data.copyright);
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                //infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 0
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                contentStr = ctemplate({
                    title: spot.getName(),
                    category: spot.getCategory(),
                    address: spot.getAddress().toString(),
                    panoId: ""
                });
                infoWindow.setContent(contentStr +
                    '<div>No StreetView image could be found for this location.</div>');
            }
        });

        return contentStr;
    }

    function getDefIcon() {
        var image = {
            url: 'https://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin|$|	cd7d7d|FFFFFF',
            size: new google.maps.Size(21, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(21, 34),
            scaledSize: new google.maps.Size(21, 34)
        };

        return image;
    }

    function getHighlightIcon() {
        var image = {
            url: 'https://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin_star|$|7da5cd|FFFFFF',
            size: new google.maps.Size(23, 39),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(23, 39),
            scaledSize: new google.maps.Size(23, 39)
        };

        return image;
    }

    // This function should be called by view model code
    // not meant to be called within Gmap module.
    function notify(what, id) {
        switch (what) {
            case ITEM_CLICKED:
                showInfoWindow(id);
                break;
            case ITEM_UNCLICKED:
                closeInfoWindow();
                break;
            case ITEM_HIDDEN:
                hideMarker(id);
                break;
            case ITEM_REVEALED:
                showMarker(id);
                break;
        }
    }

    function restoreMap() {
        if (polygon)
            polygon.setMap(null);
        drawingManager.setDrawingMode(null);
        closeInfoWindow();
        viewModel.notify(RESTORE_ALL);
        showAllMarkers();
    }

    function processPolygon(event) {
        // First, check if there is an existing polygon.
        // If there is, get rid of it
        if (polygon) {
            polygon.setMap(null);
        }
        // Switching the drawing mode to the HAND (i.e., no longer drawing).
        drawingManager.setDrawingMode(null);
        // Creating a new editable polygon from the overlay.
        polygon = event.overlay;
        polygon.setEditable(true);

        // Searching within the polygon.
        markInPolygon();
        // Make sure the search is re-done if the poly is changed.
        polygon.getPath().addListener('set_at', markInPolygon);
        polygon.getPath().addListener('insert_at', markInPolygon);
        polygon.getPath().addListener('remove_at', markInPolygon);
    }

    function markInPolygon() {
        var matches = 0,
            area = google.maps.geometry.spherical.computeArea(polygon.getPath());

        _.each(markers, function (marker) {
            if (google.maps.geometry.poly.containsLocation(marker.position, polygon)) {
                marker.setMap(map);
                viewModel.notify(MARKER_REVEALED, marker.id);
                matches++;
            }
            else {
                marker.setMap(null);
                viewModel.notify(MARKER_HIDDEN, marker.id);
            }
        });

        // Let us close any open infowindow!
        closeInfoWindow();

        // Inform the view to update the search result
        area = (area / (1000000)).toFixed(2);
        viewModel.updateFilterResult(matches, (" for city area (approx) " + area + " sq.km"));
    }

    function geoCode(city, callback) {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': city}, function (results, status) {
            callback(results, status);
        });
    }

    return {
        init: init,
        addMarker: addMarker,
        showAllMarkers: showAllMarkers,
        notify: notify,
        geoCode: geoCode
    };
}());