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
    templateUrl: '/app/apps/engine/views/edit.html',
    resolve: {
      engine: function($route, $q, Engines) {
        //determine if we're creating or editing a engine.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          Engines.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      }
    }
  })

  .when('/engine', {
    controller: 'EngineIndexCtrl',
    templateUrl: '/app/apps/engine/views/index.html',
    resolve: {
      engines: function($route, $q, Engines) {
        var deffered = $q.defer();
        Engines.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
