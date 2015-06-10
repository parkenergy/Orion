Simply duplicate this file and change the extension to .js
Then find and replace Orion with "MyAppName"

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
      templateUrl: '/Common/public/angular/views/redirecting.html',
    })
    .when('/myaccount', {
      needsLogin: false,
      controller: 'MyAccountCtrl',
      templateUrl: '/Common/public/angular/views/myaccount.html',
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
      templateUrl: '/Common/public/angular/views/example.html'
    })
    .when('/', {
      controller: 'HomepageCtrl',
      templateUrl: '/Common/public/angular/views/homepage.html'
    });
  }]);


  /* Handle errors from the server side
  ----------------------------------------------------------------------------- */
  // angular.module('Orion').config(['$httpProvider',
  // function ($httpProvider) {
  //   $httpProvider.interceptors.push('Handler401');
  // }]);
