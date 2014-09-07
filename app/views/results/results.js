'use strict';

var app = angular.module('myApp.results', ['ngRoute']);

app.directive('searchResults', function(){
  return {
    restrict: 'E',
    templateUrl: 'views/results/search-results.html'
  };
});

app.controller('ResultsController', [function($scope) {
  var self = this;
  self.results = [];
  self.related = null;

  self.search = function() {
    console.log("search!")
    var cuis = $("#searchQuery").select2("val");
    $.ajax({
      url: "http://198.199.104.222:9200/medhack/_search",
      data: {q: cuis.join(" ")},
      dataType: 'json',
      success: function(data) {
        self.results = data["hits"]["hits"].map(function(hit){return {
          id: hit["_source"].id,
          urlId: hit["_source"].id.replace(/_/g, '/'),
          title: hit["_source"].title,
          text: hit["_source"].text}
        });
      }
    });
    $.ajax({
      url: "http://198.199.104.222:9200/terms/_search",
      data: {q: cuis.join(" ")},
      dataType: 'json',
      success: function(data) {
        var hits = data["hits"]["hits"].map(function(hit){return hit["_source"]});
        var categories = {};
        for (var i = 0; i < hits.length; i++) {
          var hit = hits[i];
          for (var j = 0; j < hit.terms.length; j++) {
            var term = hit.terms[j];
            if (cuis.indexOf(term.cui) == -1) {
              if (categories[term.sty] === undefined) {
                categories[term.sty] = [];
              }
              categories[term.sty].push(term);
            }
          }
        }
        console.log(categories)
        self.related = categories;
      }
    });
  }
}]);