App.Views.WordioGameView = Backbone.View.extend({
	el: $('.app'),

	initialize: function(){

	},
	renderMenu:function() {
		var tmpl = this.templates.menu;

		this.$el.html(_.template(tmpl,{}));
	},

	//<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="auto" height="auto" />
	templates: {
		menu:'\
		<h1>Wordio</h1>\
		<ul class="menu">\
			<li><a href="#play" class="play-btn">Play</a></li>\
		</ul>\
		'
	}
});