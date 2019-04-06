App.Routers.WordioRouter = Backbone.Router.extend({
	routes: {
		"":globals.web ? "endlessPlay" : "index",
		"index":"index",
		"play":"play",
		"endless-play":"endlessPlay",
		"how-to-play":"howToPlay",
		"leaderboard":"leaderboard",
		"settings":"settings",
		"purchase":"purchase"
	},

	/* Menu screen */
	index: function() {
		//show menu
		$("body").addClass("main-menu");
		wordioGameView.renderMenu();

		util.sparkle($("h1"));

	},

	play: function() {
		this.prepGame();
		letterGridView.renderLevel1(true);
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
	endlessPlay:function() {
		this.prepGame();
		$("body").addClass("endless-mode");
		letterGridView.renderLevel2(true);
	},
	prepGame:function() {
		$("body").removeClass("main-menu").addClass("game-screen");
		util.removeSparkle();
		util.sparkleImg = [];
	},
	howToPlay:function() {
		$("body").removeClass("main-menu endless-mode").addClass("game-screen");
		util.removeSparkle();
		letterGridView.renderHowToPlay();
	},
	leaderboard:function() {
		if(typeof(gamecenter) !== "undefined") {
			var data = {
			    leaderboardId: "board1"
			};
			gamecenter.showLeaderboard(function(){}, function(){alert("Sorry, something went wrong...");}, data);
		} else if(typeof(googleplaygame) !== "undefined") {
			googleplaygame.showLeaderboard({leaderboardId:"CgkIgdCh9vMbEAIQAA"});
		} else {
			alert("You don't seem to be connected to Game Center");
		}

	},
	settings: function() {
		wordioGameView.renderSettingsMenu();
		util.removeSparkle();

	},
	purchase:function() {

		wordioGameView.renderPurchaseScreen();
	}
});
