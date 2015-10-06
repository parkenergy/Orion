angular.module('AreaApp.Controllers', []);
angular.module('AreaApp.Directives', []);
angular.module('AreaApp.Services', ['ngResource', 'ngCookies']);

angular.module('AreaApp', [
  'AreaApp.Controllers',
  'AreaApp.Directives',
  'AreaApp.Services',
]);


angular.module('AreaApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/area/edit/:id?', {
    controller: 'AreaEditCtrl',
    templateUrl: '/lib/public/angular/apps/area/views/edit.html',
    resolve: {
      area: function($route, $q, Areas) {
        //determine if we're creating or editing a area.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Areas.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/area', {
    controller: 'AreaIndexCtrl',
    templateUrl: '/lib/public/angular/apps/area/views/index.html',
    resolve: {
      areas: function($route, $q, Areas) {
        var deferred = $q.defer();
        Areas.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
