App.Views.WordioGameView = Backbone.View.extend({
	el: $('.app'),

	initialize: function(){
		//this.events[globals.press+' .found-word a'] = 'lookup';
		this.events[globals.press+' .audio-btn'] = 'toggleAudio';

		this.events[globals.press+' .follow'] = 'followLink';

		this.events[globals.press+' .make-purchase'] = 'buy';

		_.bindAll(this, 'renderPurchase');
	},
	renderMenu:function() {
		var tmpl = this.templates.menu;

		this.$el.html(_.template(tmpl,{highScore:globals.highScore}));

	},
	renderSettingsMenu:function() {
		if(typeof(store) !== "undefined") {
			store.off(this.renderPurchase);
		}

		var tmpl = this.templates.settingsMenu;

		var audio = {"audio":"On"};

		if(globals.audio===false) {
			audio.audio = "Off";
		}

		this.$el.html(_.template(tmpl,audio));

		if(typeof(Storage) === "undefined") {
			//no storage no purchase
			$(".make-purchase").hide();
		}


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
	followLink:function(e) {
		e.preventDefault();

		window.location.hash = $(e.currentTarget).attr("href");
	},
	renderPurchaseScreen:function() {


		if(typeof(store) !== "undefined") {
			//store.verbosity = store.DEBUG;

			if(globals.android===true) {

				store.register({
			      id: "tile_chooser_2015",
			      alias: "Tile Chooser",
			      type: store.CONSUMABLE
			    });

				store.refresh();
				store.when("tile_chooser_2015").updated(this.renderPurchase);

			} else {
				store.register({
			      id: "tileChooser2015",
			      alias: "Tile Chooser",
			      type: store.CONSUMABLE
			    });

				store.refresh();
				store.when("tileChooser2015").updated(this.renderPurchase);
			}



		} else {
			alert("Oops something went wrong...");
		}


	},
	renderPurchase:function(product) {

		if(!product) {
			alert("Oops something went wrong...");
		} else if(product.state === store.INVALID) {
			alert("Oops something went wrong...");
		} else {
			var tmpl = this.templates.purchaseScreen;
			this.$el.html(_.template(tmpl,{
				title:product.title,
				description:product.description,
				price:product.price
			}));
		}
	},
	buy:function(e) {
		e.preventDefault();
		$(".make-purchase").text("Loading");


		store.order("Tile Chooser");

		store.when("Tile Chooser").approved(function(product) {
			product.finish();

			globals.purchasedTileChooser = true;
			globals.tileChoicesRemaining += 20;

			$(".make-purchase").text("Get");

			localStorage.setItem("tileChooser", globals.tileChoicesRemaining);
			localStorage.setItem("tileChooserPurchased", true);

		});
	},
	events:{
		//globals.press+' .found-word a':'lookup',
		//globals.press+' .audio-btn':'toggleAudio'
	},
	//<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="auto" height="auto" />
	templates: {
		menu:'\
		<h1>Wordio</h1>\
		<p class="high-score">High Score: <span><%= highScore %></span></p>\
		<ul class="menu">\
			<li><a href="#play" class="btn follow">Quick Game</a></li>\
			<li><a href="#endless-play" class="btn follow">Endless Game</a></li>\
			<li><a href="#how-to-play" class="btn follow">How To Play</a></li>\
			<li><a href="#leaderboard" class="btn follow">Leaderboard</a></li>\
			<li><a href="#settings" class="btn follow">Settings</a></li>\
		</ul>\
		',
		settingsMenu:'\
		<h2>Settings</h2>\
		<a href="#index" class="back icon icon-arrow-left"><span>Back</span></a>\
		<ul class="menu settings-menu">\
			<li><a href="#" class="btn audio-btn">Audio - <span><%= audio %></span></a></li>\
			<li><a href="#purchase" class="btn follow">Tile Chooser</a></li>\
		</ul>\
		',
		purchaseScreen:'\
		<h2 class="product-title"><%= title %></h2>\
		<a href="#settings" class="back icon icon-arrow-left follow"><span>Back</span></a>\
		<p class="standard-p product-description"><%= description %></p>\
		<p class="standard-p product-price">Price: <%= price %></p>\
		<ul class="menu"><li><a href="#" class="btn make-purchase">Get</a></li></ul>\
		'
	}
});
