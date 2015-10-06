angular.module('EngineApp.Controllers', []);
angular.module('EngineApp.Directives', []);
angular.module('EngineApp.Services', ['ngResource', 'ngCookies']);

angular.module('EngineApp', [
  'EngineApp.Controllers',
  'EngineApp.Directives',
  'EngineApp.Services',
]);


angular.module('EngineApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/engine/edit/:id?', {
    controller: 'EngineEditCtrl',
    templateUrl: '/lib/public/angular/apps/engine/views/edit.html',
    resolve: {
      engine: function($route, $q, Engines) {
        //determine if we're creating or editing a engine.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Engines.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      units: function($route, $q, Units) {
        var deferred = $q.defer();
        Units.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/engine', {
    controller: 'EngineIndexCtrl',
    templateUrl: '/lib/public/angular/apps/engine/views/index.html',
    resolve: {
      engines: function($route, $q, Engines) {
        var deferred = $q.defer();
        Engines.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
