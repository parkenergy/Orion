angular.module('PartApp.Controllers', []);
angular.module('PartApp.Directives', []);
angular.module('PartApp.Services', ['ngResource', 'ngCookies']);

angular.module('PartApp', [
  'PartApp.Controllers',
  'PartApp.Directives',
  'PartApp.Services',
]);


angular.module('PartApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/part/edit/:id?', {
    controller: 'PartEditCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/part/views/edit.html',
    resolve: {
      part: function($route, $q, Parts) {
        //determine if we're creating or editing a part.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Parts.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      vendors: function ($route, $q, Vendors) {
        var deferred = $q.defer();
        Vendors.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/part', {
    controller: 'PartIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/part/views/index.html',
    resolve: {
      parts: function($route, $q, Parts) {
        var deferred = $q.defer();
        Parts.query({},
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
