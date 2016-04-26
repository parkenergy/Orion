angular.module('VendorPartApp.Controllers', []);
angular.module('VendorPartApp.Directives', []);
angular.module('VendorPartApp.Services', ['ngResource', 'ngCookies']);

angular.module('VendorPartApp', [
  'VendorPartApp.Controllers',
  'VendorPartApp.Directives',
  'VendorPartApp.Services',
]);


angular.module('VendorPartApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/vendorpart/edit/:id?', {
    controller: 'VendorPartEditCtrl',
    templateUrl: '/lib/public/angular/apps/vendorpart/views/edit.html',
    resolve: {
      vendorpart: function ($route, $q, VendorParts) {
        //determine if we're creating or editing a vendorpart.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          VendorParts.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      parts: function ($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      vendors: function ($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function ($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/vendorpart', {
    controller: 'VendorPartIndexCtrl',
    templateUrl: '/lib/public/angular/apps/vendorpart/views/index.html',
    resolve: {
      vendorparts: function ($route, $q, VendorParts) {
        var deferred = $q.defer();
        VendorParts.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
