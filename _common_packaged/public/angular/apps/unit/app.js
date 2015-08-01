angular.module('UnitApp.Controllers', []);
angular.module('UnitApp.Directives', []);
angular.module('UnitApp.Services', ['ngResource', 'ngCookies']);

angular.module('UnitApp', [
  'UnitApp.Controllers',
  'UnitApp.Directives',
  'UnitApp.Services',
]);


angular.module('UnitApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/unit/edit/:id?', {
    controller: 'UnitEditCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/unit/views/edit.html',
    resolve: {
      unit: function($route, $q, Units) {
        //determine if we're creating or editing a unit.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Units.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deferred = $q.defer();
        ServicePartners.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/unit', {
    controller: 'UnitIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/unit/views/index.html',
    resolve: {
      units: function($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  });
}]);
