/**
 * Created by Sankar on 08-01-2017.
 */

var fsquare = (function () {
    'use strict';

    var url = "https://api.foursquare.com/v2/venues/search",
        client_id = "LTP044CWAOZBWYQANA30G0RFMEUIPNKQQUTAKX1TJI5QVU2H",
        client_secret ="3N2QDLDYIHRQBIZSR3UX4TLXWIHXJNPU43DEUC02C5SVRSTJ",
        // oauth_token = "VRXHGIQJUIUYYI115MQD3ZHZFPFXB3V0LFOIO0RS43QSYVJ3",
        outdoor = "4d4b7105d754a06377d81259",
        shopping = "4d4b7105d754a06378d81259",
        food = "4d4b7105d754a06374d81259",
        artEntertainment = "4d4b7104d754a06370d81259",
        travel = "4d4b7105d754a06379d81259";

        function fetchSpots (mycity, callback) {
        url += '?' + $.param({
                'll': mycity.lat + "," + mycity.lng,
                'radius': 100000,
                // "4d4b7104d754a06370d81259,4bf58dd8d48988d181941735,4bf58dd8d48988d1e5931735,4d4b7105d754a06377d81259"
                'categoryId': (outdoor + "," + food + "," + shopping + "," + artEntertainment + "," + travel) ,
                'limit': 16,
                'intent': 'browse',
                'client_id' : client_id,
                'client_secret' : client_secret,
                'v': "20170107"
            });

        $.getJSON(url)
            .done(function (data, textStatus, jqXHR) {
                var venues = data.response.venues;

                _.each(venues, function (venue) {
                    var spot = new Spot({
                        "id": venue.id,
                        "name": venue.name,
                        "category": venue.categories[0].name,
                        "lat": venue.location.lat,
                        "lng": venue.location.lng,
                        "address": venue.location.formattedAddress
                    });

                    spotsDb.addSpot(venue.id, spot);
                });
                callback(FETCH_SUCCESS);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                callback(FETCH_FAIL, "Error: " + jqXHR.status + "," + textStatus);
            });
    }

    return {
        fetchSpots: fetchSpots,
        getName: function () {
            return "Foursquare";
        }
    };
})();