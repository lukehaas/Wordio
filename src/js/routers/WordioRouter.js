App.Routers.WordioRouter = Backbone.Router.extend({
	routes: {
		"":"index",
		"index":"index",
		"play":"play",
		"settings":"settings"
	},

	/* Menu screen */
	index: function() {
		//show menu
		$("body").addClass("main-menu");
		wordioGameView.renderMenu();
	},

	play: function() {
		$("body").removeClass("main-menu").addClass("game-screen");
		util.removeSparkle();
		letterGridView.renderLevel1();
		/*
		if(typeof(Storage) !== "undefined") {
			if(localStorage.getItem("hasPlayed")) {
				
				letterGridView.renderLevel1();
			} else {
				localStorage.setItem("hasPlayed", "true");
				globals.intro = true;
				letterGridView.renderIntro();
			}
		} else {
			alert("Something has gone very wrong");
		}*/
		
	},
	settings: function() {
		wordioGameView.renderSettingsMenu();
		util.removeSparkle();

	}
});