angular.module('VendorApp.Controllers', []);
angular.module('VendorApp.Directives', []);
angular.module('VendorApp.Services', ['ngResource', 'ngCookies']);

angular.module('VendorApp', [
  'VendorApp.Controllers',
  'VendorApp.Directives',
  'VendorApp.Services',
]);


angular.module('VendorApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/vendor/edit/:id?', {
    controller: 'VendorEditCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/vendor/views/edit.html',
    resolve: {
      vendor: function($route, $q, Vendors) {
        //determine if we're creating or editing a vendor.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Vendors.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      vendorFamilies: function($route, $q, VendorFamilies) {
        var deferred = $q.defer();
        VendorFamilies.query({},
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

  .when('/vendor', {
    controller: 'VendorIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/vendor/views/index.html',
    resolve: {
      vendors: function($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
