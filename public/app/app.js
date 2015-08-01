angular.module('Orion.Controllers', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies', ]);

angular.module('Orion', [
  'CommonControllers',
  'CommonDirectives',
  'CommonServices',
  'Orion.Controllers',
  'Orion.Directives',
  'Orion.Services',
  'AreaApp',
  'CompressorApp',
  'CountyApp',
  'CustomerApp',
  'EngineApp',
  'LocationApp',
  'PartApp',
  //'StateApp',
  'UnitApp',
  'UserApp',
  'VendorApp',
  'WorkOrderApp',
  'ui.bootstrap',
  'ui.utils'
  ]);

  angular.module('Orion').config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
    .when('/login', {
      controller: 'SessionCtrl',
      templateUrl: '/_common_packaged/public/angular/views/redirecting.html',
    })
    .when('/myaccount', {
      needsLogin: false,
      controller: 'MyAccountCtrl',
      templateUrl: '/_common_packaged/public/angular/views/myaccount.html',
      resolve: {
        workorders: function($route, $q, WorkOrders) {
          var deferred = $q.defer();
          WorkOrders.query({skip: 0, limit: 50},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
      }
    })
    .when('/example', {
      controller: 'ExampleCtrl',
      templateUrl: '/_common_packaged/public/angular/views/example.html'
    })
    .when('/', {
      controller: 'HomepageCtrl',
      templateUrl: '/_common_packaged/public/angular/views/homepage.html'
    });
  }]);


  /* Handle errors from the server side
  ----------------------------------------------------------------------------- */
  // angular.module('Orion').config(['$httpProvider',
  // function ($httpProvider) {
  //   $httpProvider.interceptors.push('Handler401');
  // }]);
