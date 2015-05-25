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
    templateUrl: '/app/apps/unit/views/edit.html',
    resolve: {
      unit: function($route, $q, Units) {
        //determine if we're creating or editing a unit.
        var id = $route.current.params._id || 0;
        if (id) {
          var deffered = $q.defer();
          Units.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      servicePartners: function($route, $q, ServicePartners) {
        var deffered = $q.defer();
        ServicePartners.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/unit', {
    controller: 'UnitIndexCtrl',
    templateUrl: '/app/apps/unit/views/index.html',
    resolve: {
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  });
}]);
