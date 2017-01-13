/**
 * Created by Sankar on 05-01-2017.
 */
'use strict';

function Spot(data) {
    this.id = data.id;
    this.name = data.name;
    this.position = new Position (data.lat, data.lng);
    this.category = data.category;
    this.address = data.address;
}

Spot.prototype.getName = function () {
    return this.name;
};

Spot.prototype.getPosition = function () {
    return this.position;
};

Spot.prototype.getID = function () {
    return this.id;
};

Spot.prototype.getCategory = function () {
    return this.category;
};

Spot.prototype.getAddress = function () {
    return this.address;
};

function Position (lat, lng) {
    this.lat = parseFloat(lat);
    this.lng = parseFloat(lng);
}

Position.prototype.getLat = function () {
    return this.lat;
};

Position.prototype.getLng = function () {
    return this.lng;
};

var spotsDb = {
    spots: {},
    addSpot:    function (id, spot) {
        this.spots[id] = spot;
    },

    getSpot:    function (id) {
        return this.spots[id];
    },

    getAllSpots: function () {
        return this.spots;
    }
};