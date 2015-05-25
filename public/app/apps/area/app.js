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
    templateUrl: '/app/apps/area/views/edit.html',
    resolve: {
      area: function($route, $q, Areas) {
        //determine if we're creating or editing a area.
        var id = $route.current.params._id || 0;
        if (id) {
          var deffered = $q.defer();
          Areas.get({id: id},
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

  .when('/area', {
    controller: 'AreaIndexCtrl',
    templateUrl: '/app/apps/area/views/index.html',
    resolve: {
      areas: function($route, $q, Areas) {
        var deffered = $q.defer();
        Areas.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);
