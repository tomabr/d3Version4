'use strict';

angular.module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }

      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = 'http://d3js.org/d3.v4.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return {
        d3: function() { return d.promise; }
      };
}]);

angular.module('app', ['d3']);
angular.module('app', ['d3']).config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});
angular.module('app', ['d3']).service('StockService', StockService);
angular.module('app', ['d3']).controller('myController', myController);

function myController(StockService, $scope) {
  var model = this;
  var companyNames = [];
  var company = {};
  model.companiesNames = ['CSCO', 'MSFT', 'ADBE'];

  model.showCompany = function(name){
    if(!!company[name]){
      model.company = company[name];
      return;
    }
    company[name] = [];
    StockService.getCompanyDate(name).then(function(response){
      var data=response.quote;
      angular.forEach(data, function(value) {
        value.Date = new Date(value.Date.split('-').join(','));
        company[name].push(value);
        model.companyNames = companyNames;
        model.company = company[name];

      });
    }, function(error){
      alert('error');
    });
  };
}

function StockService($http, $q) {
  var domain = "http://query.yahooapis.com/v1/public/yql?q=";
  var query = "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

  return {
    getCompanyDate: function(name){
      var url = domain +
      encodeURI("select * from yahoo.finance.historicaldata where symbol in('"
       + name +
       "')and startDate = '2016-01-01' and endDate = '2016-06-30'") +
      query;

      var deferred = $q.defer();
      $http.get(url).then(function(response) {
        var date = angular.fromJson(response.data.query.results);
        deferred.resolve(date);
      }, function(error) {
        deferred.reject({ message: 'Problem with connection' });
      });
      return deferred.promise;
    }
  };
}
