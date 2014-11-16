App.Routers.WordioRouter = Backbone.Router.extend({
	routes: {
		"":"index",
		"index":"index",
		"play":"play"
	},

	/* Menu screen */
	index: function() {
		//show menu
		wordioGameView.renderMenu();
	},

	play: function() {
		letterGridView.renderLevel1();
	}
});