/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var wordioGameView,
wordioRouter,
letterGridView,
globals = {
    alphabet: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
    letterProperties: {
        "A":{"type":"v","point":1},
        "B":{"type":"c","point":3},
        "C":{"type":"c","point":3},
        "D":{"type":"c","point":2},
        "E":{"type":"v","point":1},
        "F":{"type":"c","point":4},
        "G":{"type":"c","point":3},
        "H":{"type":"c","point":4},
        "I":{"type":"v","point":1},
        "J":{"type":"c","point":5},
        "K":{"type":"c","point":5},
        "L":{"type":"c","point":2},
        "M":{"type":"c","point":3},
        "N":{"type":"c","point":2},
        "O":{"type":"v","point":1},
        "P":{"type":"c","point":3},
        "Q":{"type":"c","point":6},
        "R":{"type":"c","point":2},
        "S":{"type":"c","point":2},
        "T":{"type":"c","point":2},
        "U":{"type":"v","point":1},
        "V":{"type":"c","point":5},
        "W":{"type":"c","point":4},
        "X":{"type":"c","point":6},
        "Y":{"type":"c","point":4},
        "Z":{"type":"c","point":6}
    },
    vowels: ["A","E","I","O","U"],
    consonants: {
        "1":["B","C","D","F","G","H","K","L","M","N","P","R","S","T","W"],
        "2":["J","Q","V","X","Y","Z"]},
    tileSettings:{
        row:5,
        column:7,
        tileSize:0
    },
    letter:[],
    canMove:true,
    debug:3,    //- 1 is full debug including tiles, 2 is just control over drop-in tiles, 3 is currently standard and availale for realocation
    debugTiles:[
    "?","?","X","X","X",
    "X","X","G","X","X",
    "X","?","O","X","X",
    "X","X","T","X","X",
    "X","R","I","G","X",
    "X","?","X","X","X",
    "X","X","?","?","X"],
    debugDropIn:["P","U","T"],
    debugCounter:0,
    found:false,
    wordLookup:"http://www.collinsdictionary.com/dictionary/english/",
    currentScore:0,
    intro:false,
    tileSlectionEnabled:false,
    chosenBlank:null,
    timeLeft:150,
    //timeLeft:5,
    mainTimer:null,
    paused:false,
    cssPrefix:""
};

var App = {
    Collections: {},
    Models: {},
    Views: {},
    Routers: {},
    start: function(){
        Backbone.history.start(/*{pushState: true}*/); // pushState will require a polyfill for IE 8-. Safest to use hashes instead.
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        if (!window.cordova) {
            $(this.onDeviceReady);
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
        var w = parseInt($(".app").width()/globals.tileSettings.row);
        var h = parseInt(($(".app").height()*0.75)/globals.tileSettings.column);

        globals.tileSettings.tileSize = Math.min(w,h);
        

        wordioGameView = new App.Views.WordioGameView();
        letterGridView = new App.Views.LetterGridView();

        wordioRouter = new App.Routers.WordioRouter({});

        util.loadSounds();
        util.setCSSPrefix();

        App.start();

    }

};
