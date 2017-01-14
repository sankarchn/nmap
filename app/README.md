# Neighborhood Map Project

## Introduction

This web app is developed to meet the requirements of Neighborhood Map project as defined for Udacity Front End Nanodegree
requirements.

## Application Overview

This tool provides information on a few places in and around Chennai, India. The application makes use of 
APIs provided by **Foursquare** and **Google** for gathering details on places and rendering them on a map. 
The following features are implemented:

* Auto fetch of latitude & longitude for the chosen city (Chennai) using Google Geocoding service
* Querying **Foursquare** REST servers to fetch spots in Chennai for the following categories
  - outdoor, food, shopping, artEntertainment, travel.
  - Limiting the search for 16 places for a radius of 50KM
  - Using Jquery ajax APIs asynchronously with error handling
* The places are displayed on a map and there is a side panel with text listing of the places.
* Clicking an entry on the list highlights the associated marker on the map and opens an info window.
* Clicking a marker on the map highlights the associated list entry as well as opens the info window.
* The info window consists of the following information
   - place name
   - place category
   - address 
   - (all of the above obtaine from Foursquare)
   - StreetView image from Google for the same location or a nearby location. Where images are not available, there
     is a text to that effect in the info window. Only few places in my city have StreetView images and even when
     available are some times not really relevant for the particular place. Anyway.
* There is a text input box to allow filtering of the entries. Type any characters and do *press enter*. 
  Submitting an empty string restores the list. Matching is done against the name of the place and not 
  category or address.   
* One can also draw a polygon on the map. This will automatically filter the map to display only markers falling
  within the polygon. Corresponding entries in the list are highlighted. The area of the polygon is calculated
   and displayed on the list panel. *Double click on the map to restore all
  the markers*.
* If the browser is resized, the map window is resized and recentered.
* The app has been validated on iPad and Micromax android phone. In case of mobile & tab, the list panel
  is not shown by default and can be invoked through the hamburger button. Further, there are some slight
  variations in the way panel is displayed/closed:
     - in iPad, the panel is overlayed partially on the screen and stays on till closed explicitly.
     - in phone, the panel is overlayed almost fully on the screen and is closed as soon as the user clicks a 
       list entry (as the info window has to be opened).
     - polygon drawing is available on tab & phone as well.  

## Technology Components
* Bootstrap
* jQuery
* Underscore.js
* knockout.js
* Foursquare REST APIs
* Google Maps API
* Google font
* Npm, Gulp and assorted plugins for fetching required modules, minifying, cache busting

## Building and Lauching the App
* The application uses Gulp and related plugins to build the components. 
  The files are organized as below:
  Top //Launch the app from here.
   - app
     - src //holds all the sources required to build
         - css
         - js
         - index.html
     - gulpfile.js
     - package.json
     - README.md
   - css
   - fonts
   - js
   - maps //sourcemaps
   - index.html // Launch file
   - README.md // copy of README.md 

* Install the required modules typing `$ npm install` 
* Type `$ gulp` at the command prompt. This will minify and add digests to the js and css files and  update the index.html accordingly.       
* Launch a web server pointing to the top level directory. 
     
### Credits
* [SnazzyMaps](https://snazzymaps.com) for the map style config.
* Very useful Code snippets from the practice code provided along with Google Maps lessons.    

