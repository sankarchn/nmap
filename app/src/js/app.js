/**
 * Created by Sankar on 04-01-2017.
 */

// map is rendered only after both map has been loaded async
// *AND* DOM is ready (need DOM element to anchor the map).
// Using underscore.js to wait for both events to complete
var drawMyMap = _.after(2, bakeMyMap);

function bakeMyMap() {
    fsquare.fetchSpots(myCity.location, function (status, err) {
        if (status === FETCH_SUCCESS) {
            Gmap.init(mapDiv, myCity.location, MAP_ZOOM_LEVEL, vModel);

            _.each(spotsDb.getAllSpots(), function (spot, id) {
                vModel.addSpot(id);
                Gmap.addMarker(id);
            });

            Gmap.showAllMarkers();

            vModel.notifySpotEvent(FETCH_SUCCESS, err);
        }
        else {
            vModel.notifySpotEvent(FETCH_FAIL, err);
        }
    });
}

function launch() {
    Gmap.geoCode(myCity.name, function (results, status) {
        if (status === 'OK') {
            myCity.location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            drawMyMap();

        } else {
            vModel.notifySpotEvent(FETCH_FAIL, 'Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Called when Google maps api did not load/init successfully
// script tag onerror() call.
function launchError () {
    // It is possible, DOM ready fn is not called yet.
    // Note that vModel is a singleton.
    if (!vModel)
        vModel = ListView.getVmodel(myCity.name, fsquare.getName());
    vModel.notifySpotEvent(FETCH_FAIL, "Unable to load Google Maps.");
}

// as per Google docs, called by Google libraries when the server auth fails
function gm_authFailure() {
    // It is possible, DOM ready fn is not called yet.
    // Note that vModel is a singleton.
    if (!vModel)
        vModel = ListView.getVmodel(myCity.name, fsquare.getName());
    vModel.notifySpotEvent(FETCH_FAIL, "Google Maps server authentication failed");
}

// basic type checking
function getDeviceType () {
    var wd = window.screen.width;
    if (wd <= MOBILE_MAXWIDTH)
        return PHONE_FORM;
    else if (wd <= TAB_MAXWIDTH) {
        return TAB_FORM;
    }
    else
        return DESKTOP_FORM;
}

$(document).ready(function () {
    vModel = ListView.getVmodel(myCity.name, fsquare.getName());
    mapDiv = $("#map")[0];
    drawMyMap();
});

