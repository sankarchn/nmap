/**
 * Created by Sankar on 05-01-2017.
 */

var ListView = (function () {
    'use strict';

    var curClickSpot = null,
        listVmodel = null,
        SHOW_IN_LIST = true,
        HIDE_IN_LIST = false,
        HIGHLIGHT_ENTRY = true,
        UNHIGHLIGHT_ENTRY = false;

    var loadSuccessText = _.template('<h2><%= mycount %> spots found in <%= mycity %> using <%= myprovider %> APIs<hr></h2>');
    var loadFailText = _.template('<h2>Unable to retrieve places data using <%= provider %>. <br><br>Reason: <%= reason %>.</h2>');
    var filterResults = _.template('<h3><%= count %> spots match pattern \"<%= patstr %>\"</h3>');
    var ViewModel = function (city, provider) {
        var self = this;
        // update the title with city name
        self.cityName = ko.observable(city);
        self.pgHeader = "Explore " + city;

        // data provider - Foursquare etc.,
        // providerFail suppresses filter box and displays
        // error message. Reason is whatever supplied by the caller
        self.providerName = provider;
        self.providerFail = ko.observable(false);
        self.failReason = "";

        // the core view data structure that holds the view data -
        // place names and whether it is filtered, clicked etc.,
        self.spItemList = ko.observableArray();

        // this field captures the user input for filtering the list
        self.inputStr = ko.observable("");

        // this string holds pattern that was matched successfully
        // storing it in a different var after matching so that the
        // input box that is bound to inputStr gets cleare.
        self.patString = "";

        // showFiltResults is turned on when the user types a string on
        // the text box or draws a polygon on the map
        self.showFiltResults = ko.observable(false);
        self.matches = ko.observable(0);
        self.drawingMode = ko.observable(false);

        // prompt user to filter the result only when there is more than 1 item
        self.listCounter = ko.observable(0);

        // show how many match user input
        self.filtResult = ko.computed(function () {
            if (self.showFiltResults()) {
                return filterResults({
                    count: self.matches(),
                    patstr: self.patString
                });
            }
            return "";
        });

        // turn on or off the list based on width
        self.listWidth = ko.observable('0');
        self.listShow = ko.observable("block");

        self.closeList = function () {
            self.listShow("none");
        };

        self.openList = function () {
            self.listShow("block");
        };

        // for small devices, start with the list closed.
        self.dType = getDeviceType();
        if ((self.dType === TAB_FORM) || (self.dType === PHONE_FORM))  {
            self.closeList();
        }

        // text displayed when the load is not successful
        self.loadFail = ko.computed(function () {
            if (self.providerFail()) {
                // for smaller devices, open the list
                // so that the error message is displayed by default.
                if ((self.dType === TAB_FORM) ||
                    (self.dType === PHONE_FORM))  {
                    self.openList();
                }
                return loadFailText({
                    provider: self.providerName,
                    reason: self.failReason
                });
            }
        });

        // display total no. of spots when you get some data from provider
        self.loadSuccess = ko.computed(function () {
            return loadSuccessText({
                mycount: self.listCounter(),
                mycity: self.cityName(),
                myprovider: self.providerName
            });
        });

        self.inpChange = function () {
            self.showFiltResults(false);
            self.filterList();
        };

        self.addSpot = function (id) {
            var spItem,
                index;

            spItem = new ListItem(id, spotsDb.getSpot(id).getName());
            // Let us insert into the list sorted
            index = _.sortedIndex(self.spItemList(), spItem, 'name');
            self.spItemList.splice(index, 0, spItem);
            self.listCounter(self.listCounter() + 1);
        };

        // This function is bound to the html li item and is called
        // whenever a list item is clicked.
        self.listClickfn = function (spItem, event) {
            var prevSpot = curClickSpot;

            if (!spItem.isClicked()) {
                // If some other item had been clicked, remove its
                // highlight
                if (prevSpot != null) {
                    setDisplayParams(prevSpot, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                }

                // Highlight the current item
                setDisplayParams(spItem, SHOW_IN_LIST, HIGHLIGHT_ENTRY);
                Gmap.notify(ITEM_CLICKED, spItem.getID());
                curClickSpot = spItem;

                // on phones, do not keep the list open when an item is clicked as
                // the list overlays map almost full
                if (self.dType == PHONE_FORM) {
                    self.closeList();
                }
            }
            else {
                // we are unclicking a previous click on the same item
                // stop highlighting and make sure to reset "curClick" items
                setDisplayParams(spItem, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                Gmap.notify(ITEM_UNCLICKED, spItem.getID());
                curClickSpot = null;
            }
        };

        function findspItem(id) {
            var len = self.spItemList().length,
                spItem,
                index;

            for (index = 0; index < len; index++) {
                spItem = self.spItemList()[index];
                if (spItem.getID() == id) {
                    return spItem;
                }
            }

            return null;
        }

        function setDisplayParams(spItem, show, highlight) {
            spItem.setVisibility(show);
            spItem.setClicked(highlight);
        }

        // This function is called by map code when markers are clicked/hidden
        // to keep the corresponding list entries in sync.
        // not meant to be called within list view module.
        self.notify = function (what, data) {
            var len,
                spItem,
                index,
                id = data;

            switch (what) {
                case MARKER_CLICKED:
                    spItem = findspItem(id);
                    if ((curClickSpot != spItem) && (curClickSpot != null)) {
                        // clear out any previous clicks
                        setDisplayParams(curClickSpot, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                    }
                    setDisplayParams(spItem, SHOW_IN_LIST, HIGHLIGHT_ENTRY);
                    curClickSpot = spItem;
                    break;

                case MARKER_UNCLICKED:
                    spItem = findspItem(id);
                    setDisplayParams(spItem, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                    curClickSpot = null;
                    break;

                case MARKER_HIDDEN:
                    spItem = findspItem(id);
                    setDisplayParams(spItem, HIDE_IN_LIST, UNHIGHLIGHT_ENTRY);
                    break;

                case MARKER_REVEALED:
                    spItem = findspItem(id);
                    setDisplayParams(spItem, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                    break;

                case RESTORE_ALL:
                    len = self.spItemList().length;
                    for (index = 0; index < len; index++) {
                        spItem = self.spItemList()[index];
                        setDisplayParams(spItem, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                    }
                    self.inputStr("");
                    self.showFiltResults(false);
                    self.drawingMode(false);
                    break;

            }
        };

        // called by app initialization logic once the spots are loaded or
        // loading has failed
        self.notifySpotEvent = function (what, data) {
            switch (what) {
                case FETCH_FAIL:
                    self.failReason = data;
                    self.providerFail(true);
                    break;
                case FETCH_SUCCESS:
                    self.providerFail(false);
                    break;
            }
        };

        // called by map code when the user filtered the markers
        // drawing a polygon, this basically updates the result text displayed
        self.updateFilterResult = function (matches, str) {
            // on phones & tabs, open the list so that user can get to
            // view the relevant markers and area
            if ((self.dType === TAB_FORM)
                || (self.dType === PHONE_FORM)) {
                self.openList();
            }

            self.matches(matches);
            self.patString = str;
            self.inputStr("");
            self.showFiltResults(true);
            self.drawingMode(true);
        };

        // called when the user types text in the filter box
        self.filterList = function () {
            var searchStr = self.inputStr(),
                srchRegex,
                count = 0;

            srchRegex = new RegExp(searchStr, "i");
            _.each(self.spItemList(), function (spItem) {
                if (spItem.getName().search(srchRegex) == -1) {
                    setDisplayParams(spItem, HIDE_IN_LIST, UNHIGHLIGHT_ENTRY);
                    Gmap.notify(ITEM_HIDDEN, spItem.getID());
                }
                else {
                    setDisplayParams(spItem, SHOW_IN_LIST, UNHIGHLIGHT_ENTRY);
                    Gmap.notify(ITEM_REVEALED, spItem.getID());
                    count++;
                }
            });

            // Note that we have already looped through all the items and turned on/off
            // visibility even when the length is zero. This is to ensure a blank string
            // restores the full list.
            if (searchStr.length == 0) {
                self.showFiltResults(false);
            }
            else {
                self.matches(count);
                self.patString = self.inputStr();
                self.showFiltResults(true);
            }
        };
    };

    function getVmodel(city, provider) {
        if (listVmodel != null)
            return listVmodel;

        listVmodel = new ViewModel(city, provider);
        ko.applyBindings(listVmodel);

        return listVmodel;
    }

    return {
        getVmodel: getVmodel
    };

}());

