/**
 * Created by dell on 13-01-2017.
 */
'use strict';

var myCity = {
    name: "Chennai",
    location: {}  // determined using geocode at runtime
};

var vModel, // ref to knockout view model
    mapDiv;

//  constants used to signal events between views
var ITEM_CLICKED = 100,
    ITEM_UNCLICKED = 200,
    ITEM_HIDDEN = 300,
    ITEM_REVEALED = 400,
    MARKER_CLICKED = 500,
    MARKER_UNCLICKED = 600,
    MARKER_HIDDEN = 700,
    MARKER_REVEALED = 800,
    RESTORE_ALL = 900,
    FETCH_SUCCESS = 1,
    FETCH_FAIL = 0;

var MAP_ZOOM_LEVEL = 14;

var MOBILE_MAXWIDTH = 450,
    TAB_MAXWIDTH = 768,
    PHONE_FORM = 10,
    TAB_FORM = 20,
    DESKTOP_FORM = 30;
