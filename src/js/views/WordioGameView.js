App.Views.WordioGameView = Backbone.View.extend({
	el: $('.app'),

	initialize: function(){

	},
	renderMenu:function() {
		var tmpl = this.templates.menu;

		this.$el.html(_.template(tmpl,{highScore:globals.highScore}));

		util.sparkle($("h1"));
	},
	renderSettingsMenu:function() {
		var tmpl = this.templates.settingsMenu;

		var audio = {"audio":"On"};

		if(globals.audio===false) {
			audio.audio = "Off";
		}

		this.$el.html(_.template(tmpl,audio));
	},
	lookup:function(e) {
		e.preventDefault();

		var href = $(e.currentTarget).attr("href");
		
		window.open(href, '_blank','location=yes');
	},
	toggleAudio:function(e) {
		e.preventDefault();

		if(globals.audio) {
			$(".audio-btn").find("span").text("Off");
			globals.audio = false;
		} else {
			$(".audio-btn").find("span").text("On");
			globals.audio = true;
		}

		if(typeof(Storage) !== "undefined") {
			localStorage.setItem("audioOn", globals.audio);
        }
	},
	events:{
		'click .found-word a':'lookup',
		'click .audio-btn':'toggleAudio'
	},
	//<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="auto" height="auto" />
	templates: {
		menu:'\
		<h1>Wordio</h1>\
		<p class="high-score">High Score: <span><%= highScore %></span></p>\
		<ul class="menu">\
			<li><a href="#play" class="btn">New Game</a></li>\
			<li><a href="" class="btn">How To Play</a></li>\
			<li><a href="" class="btn">Leaderboard</a></li>\
			<li><a href="#settings" class="btn">Settings</a></li>\
		</ul>\
		',
		settingsMenu:'\
		<h2>Settings</h2>\
		<a href="#index" class="back icon icon-arrow-left"><span>Back</span></a>\
		<ul class="menu">\
			<li><a href="#" class="btn audio-btn">Audio - <span><%= audio %></span></a></li>\
			<li><a href="#" class="btn">Tile Chooser</a></li>\
		</ul>\
		'
	}
});