/**
 * Created by Sankar on 05-01-2017.
 */

'use strict';

function ListItem (id, name) {
    this.id = id;
    this.name = name;
    this.isVisible = ko.observable(true);
    this.clickStatus = ko.observable(false);
}

ListItem.prototype.getName = function () {
    return this.name;
};

ListItem.prototype.getID = function () {
    return this.id;
};

ListItem.prototype.isClicked = function () {
    return this.clickStatus();
};

ListItem.prototype.setClicked = function (status) {
    this.clickStatus(status);
};

ListItem.prototype.setVisibility = function (status) {
    this.isVisible(status);
};
