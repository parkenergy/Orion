angular.module('InventoryTransferApp.Controllers', []);
angular.module('InventoryTransferApp.Directives', []);
angular.module('InventoryTransferApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('InventoryTransferApp', [
  'InventoryTransferApp.Controllers',
  'InventoryTransferApp.Directives',
  'InventoryTransferApp.Services',
]);

angular.module('InventoryTransferApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/inventorytransfer/edit/:id?', {
    needsLogin: true,
    controller: 'InventoryTransferEditCtrl',
    templateUrl: '/lib/public/angular/apps/inventorytransfer/views/edit.html',
    resolve: {
      inventorytransfer: function($route, $q, InventoryTransfers) {
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          InventoryTransfers.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        }
        else { return null; }
      },
      parts: function($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) {return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      users: function($route, $q, Users) {
        var deferred = $q.defer();
        Users.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      locations: function($route, $q, Locations){
        var deferred = $q.defer();
        Locations.query({},
          function (response){ return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })
  .when('/inventorytransfer', {
    needsLogin: true,
    controller: 'InventoryTransferIndexCtrl',
    templateUrl: '/lib/public/angular/apps/inventorytransfer/views/index.html',
    resolve: {
      inventorytransfers: function($route, $q, InventoryTransfers) {
        var deferred = $q.defer();
        InventoryTransfers.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);

angular.module('InventoryTransferApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
  var original = $location.path;
  $location.path = function (path, reload) {
    if ( reload === false ) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
        $route.current = lastRoute;
        un();
      });
    }
    return original.apply($location, [path]);
  };
}]);
