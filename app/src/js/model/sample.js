/**
 * Created by Sankar on 05-01-2017.
 */
'use strict';

var sample = (function () {

    var places = [
        {
            "id": 0,
            "name": "Marina Beach",
            "lat": "13.047662900808886",
            "lng": "80.2806979251197"
        },

        {
            "id": 1,
            "name": "Anna Nagar Tower Park",
            "lat": "13.086571414111077",
            "lng": "80.21362675131819"
        },

        {
            "id": 2,
            "name": "Chitlapakam lake",
            "lat": "12.933315880239075",
            "lng": "80.13799263592671"
        },

        {
            "id": 3,
            "name": "Thiruvanmiyur Beach",
            "lat": "12.980722245625548",
            "lng": "80.26800155639648"
        },

        {
            "id": 4,
            "name": "Valluvar kottam",
            "lat": "13.052757448973187",
            "lng": "80.24267129698562"
        },

        {
            "id": 5,
            "name": "Besant Nagar Beach (Edward Elliot's Beach)",
            "lat": "13.000506258411747",
            "lng": "80.27084040530782"
        },

        {
            "id": 6,
            "name": "PVR - The Grand Mall Velachery",
            "lat": "12.972083447836322",
            "lng": "80.21869787142035"
        },

        {
            "id": 7,
            "name": "AGS Cinemas, T. Nagar",
            "lat": "13.047377851967205",
            "lng": "80.24509984915464"
        },

        {
            "id": 8,
            "name": "Sathyam Cinemas",
            "lat": "13.055687857317821",
            "lng": "80.25809632255645"
        },

        {
            "id": 9,
            "name": "Escape Cinemas",
            "lat": "13.058725377915014",
            "lng": "80.26413380533735"
        },

        {
            "id": 10,
            "name": "Forum Vijaya Mall",
            "lat": "13.05029938745061",
            "lng": "80.20947594272806"
        },

        {
            "id": 11,
            "name": "M A Chidambaram Stadium",
            "lat": "13.062830126112663",
            "lng": "80.27923923698869"
        },

        {
            "id": 12,
            "name": "Abirami Mega Mall",
            "lat": "13.085838514881411",
            "lng": "80.24798570645463"
        },

        {
            "id": 13,
            "name": "Music Academy",
            "lat": "13.045824692206624",
            "lng": "80.25964792592062"
        },

        {
            "id": 14,
            "name": "Kapaleeswarar Temple",
            "lat": "13.0336342",
            "lng": "80.2701988"
        },

        {
            "id": 15,
            "name": "Kalikambal Temple",
            "lat": "13.09455",
            "lng": "80.2891"
        }
    ];

    var populate = function () {
        for (var j = 0; j < places.length; j++) {
            spotsDb.addSpot(j, new Spot(places[j]));
        }

    };

    return {
        fetchSpots: populate
    };
})();
