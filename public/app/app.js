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
  'ui.utils',
  'satellizer'
  ]);

  angular.module('Orion').config(['$routeProvider', '$authProvider',
    function ($routeProvider, $authProvider) {
      $routeProvider
      .when('/login', {
        controller: 'SessionCtrl',
        templateUrl: '/lib/public/angular/views/redirecting.html',
      })
      .when('/myaccount', {
        needsLogin: true,
        controller: 'MyAccountCtrl',
        templateUrl: '/lib/public/angular/views/myaccount.html',
        resolve:{
          me: function ($route, $q, Users) {
            var deferred = $q.defer();
            Users.get({id: 'me'},
              function (response) { return deferred.resolve(response); },
              function (err) { return deferred.reject(err); }
            );
            return deferred.promise;
          }
        }
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
      $authProvider.google({
        url: '/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        type: '2.0',
        popupOptions: { width: 452, height: 633 },
        clientId: '402483966217-5crk767d69pcn25dhds4htv3o67kdpuc.apps.googleusercontent.com',
        responseType: 'token'
      });
      $authProvider.httpInterceptor = function() { return true; };
      $authProvider.withCredentials = true;
      $authProvider.tokenRoot = null;
      $authProvider.baseUrl = '/';
      $authProvider.loginUrl = '/auth/login';
      $authProvider.signupUrl = '/auth/signup';
      $authProvider.unlinkUrl = '/auth/unlink/';
      $authProvider.tokenName = 'token';
      $authProvider.tokenPrefix = 'satellizer';
      $authProvider.authHeader = 'Authorization';
      $authProvider.authToken = 'Bearer';
      $authProvider.storageType = 'sessionStorage';
    }
  ]);


  /* Handle errors from the server side
  ----------------------------------------------------------------------------- */
  // angular.module('Orion').config(['$httpProvider',
  // function ($httpProvider) {
  //   $httpProvider.interceptors.push('Handler401');
  // }]);
