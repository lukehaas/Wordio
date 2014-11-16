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
        "A":{"type":"v","point":0},
        "B":{"type":"c","point":0},
        "C":{"type":"c","point":0},
        "D":{"type":"c","point":0},
        "E":{"type":"v","point":0},
        "F":{"type":"c","point":0},
        "G":{"type":"c","point":0},
        "H":{"type":"c","point":0},
        "I":{"type":"v","point":0},
        "J":{"type":"c","point":0},
        "K":{"type":"c","point":0},
        "L":{"type":"c","point":0},
        "M":{"type":"c","point":0},
        "N":{"type":"c","point":0},
        "O":{"type":"v","point":0},
        "P":{"type":"c","point":0},
        "Q":{"type":"c","point":0},
        "R":{"type":"c","point":0},
        "S":{"type":"c","point":0},
        "T":{"type":"c","point":0},
        "U":{"type":"v","point":0},
        "V":{"type":"c","point":0},
        "W":{"type":"c","point":0},
        "X":{"type":"c","point":0},
        "Y":{"type":"c","point":0},
        "Z":{"type":"c","point":0}
    },
    vowels: ["A","E","I","O","U"],
    consonants: ["B","C","D","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W","X","Y","Z"],
    tileSettings:{
        row:5,
        column:7,
        tileSize:0
    },
    letter:[],
    canMove:true,
    debug:true
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
        $(this.onDeviceReady);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var w = parseInt($(".app").width()/globals.tileSettings.row);
        var h = parseInt(($(".app").height()*0.9)/globals.tileSettings.column);

        globals.tileSettings.tileSize = Math.min(w,h);
        

        wordioGameView = new App.Views.WordioGameView();
        letterGridView = new App.Views.LetterGridView();

        wordioRouter = new App.Routers.WordioRouter({});

        App.start();

    }

};
