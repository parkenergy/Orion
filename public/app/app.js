angular.module('Orion.Controllers', []);
angular.module('Orion.Directives', []);
angular.module('Orion.Services', ['ngRoute', 'ngResource', 'ngCookies' ]);

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
  'InventoryTransferApp',
  // 'LocationApp',
  'PartApp',
  //'StateApp',
  'SupportApp',
  'TransferApp',
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
      templateUrl: '/lib/public/angular/views/redirecting.html',
    })
    .when('/myaccount', {
      needsLogin: true,
      controller: 'MyAccountCtrl',
      templateUrl: '/lib/public/angular/views/myaccount.html'
    })
    .when('/example', {
      controller: 'ExampleCtrl',
      templateUrl: '/lib/public/angular/views/example.html'
    })
    .when('/', {
      controller: 'SessionCtrl',
      templateUrl: '/lib/public/angular/views/clientLogin.html'
    });
    // .when('/', {
    //   controller: 'HomepageCtrl',
    //   templateUrl: '/lib/public/angular/views/homepage.html'
    // });
  }]);


  /* Handle errors from the server side
  ----------------------------------------------------------------------------- */
  // angular.module('Orion').config(['$httpProvider',
  // function ($httpProvider) {
  //   $httpProvider.interceptors.push('Handler401');
  // }]);
