App.Models.Letter = Backbone.Model.extend({
    defaults: {
        type:'',
        value:''
    }
});
App.Collections.Grid = Backbone.Collection.extend({
    model: App.Models.Letter
});