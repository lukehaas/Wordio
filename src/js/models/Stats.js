App.Models.Stats = Backbone.Model.extend({
    defaults: {
        currentScore:0,
        longestChain:0,
        words:0,
        crossovers:0
    }
});
App.Collections.Scores = Backbone.Collection.extend({
    model: App.Models.Stats
});