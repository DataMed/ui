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

  self.articleSort = function(a, b) {
    return b.count - a.count;
  }

  self.addConcept = function(cui, label) {
    var data = $("#searchQuery").select2("data");
    data.push({id: cui, text: label});
    $("#searchQuery").select2("data", data);
  }

  self.search = function() {
    var cuis = $("#searchQuery").select2("val");
    $.ajax({
      url: "https://co1f4s43:8f76usbx40mwcy87@azalea-4609986.us-east-1.bonsai.io:443/medhack/documents/_search",
      data: {q: cuis.join("+")},
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
      url: "https://co1f4s43:8f76usbx40mwcy87@azalea-4609986.us-east-1.bonsai.io:443/medhack/related/_search",
      data: {q: cuis.join("+"), size: 500},
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
              categories[term.sty].push($.extend(term, {count: parseInt(hit.articles)}));
            }
          }
        }

        // Sort by article frequency
        $.each(categories, function(key, value){
          categories[key] = categories[key].sort(self.articleSort).slice(0, 9);
        });

        self.related = categories;
      }
    });
  }
}]);