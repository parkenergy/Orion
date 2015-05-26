angular.module('Orion.Controllers', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies']);

angular.module('Orion', [
  'Orion.Controllers',
  'Orion.Directives',
  'Orion.Services',
  'AreaApp',
  'CompressorApp',
  'CountyApp',
  'CustomerApp',
  'EngineApp',
  'LocationApp',
  // 'PartApp',
  // 'StateApp',
  // 'UnitApp',
  // 'UserApp',
  // 'VendorApp',
  'WorkOrderApp',
  'ui.bootstrap',
  'ui.utils'
]);

angular.module('Orion').config(['$routeProvider',
function ($routeProvider) {
  $routeProvider
  .when('/login', {
    controller: 'SessionCtrl',
    templateUrl: '/app/views/redirecting.html',
  })
  .when('/myaccount', {
    needsLogin: false,
    controller: 'MyAccountCtrl',
    templateUrl: '/app/views/myaccount.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        WorkOrders.query({skip: 0, limit: 50},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })
  .when('/example', {
    controller: 'ExampleCtrl',
    templateUrl: '/app/views/example.html'
  })
  .when('/', {
    controller: 'HomepageCtrl',
    templateUrl: '/app/views/homepage.html'
  });
}]);


/* Handle errors from the server side
----------------------------------------------------------------------------- */
angular.module('Orion').config(['$httpProvider',
function ($httpProvider) {
  $httpProvider.interceptors.push('Handler401');
}]);
