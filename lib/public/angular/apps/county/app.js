angular.module('CountyApp.Controllers', []);
angular.module('CountyApp.Directives', []);
angular.module('CountyApp.Services', ['ngResource', 'ngCookies']);

angular.module('CountyApp', [
  'CountyApp.Controllers',
  'CountyApp.Directives',
  'CountyApp.Services',
]);


angular.module('CountyApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/county/edit/:id?', {
    controller: 'CountyEditCtrl',
    templateUrl: '/lib/public/angular/apps/county/views/edit.html',
    resolve: {
      county: function($route, $q, Counties) {
        //determine if we're creating or editing a county.
        var id = $route.current.params.id || 0;
        if (id) {
          var deferred = $q.defer();
          Counties.get({id: id},
            function (response) { return deferred.resolve(response); },
            function (err) { return deferred.reject(err); }
          );
          return deferred.promise;
        } else {
          return null;
        }
      },
      states: function($route, $q, States) {
        var deferred = $q.defer();
        States.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  })

  .when('/county', {
    controller: 'CountyIndexCtrl',
    templateUrl: '/lib/public/angular/apps/county/views/index.html',
    resolve: {
      counties: function($route, $q, Counties) {
        var deferred = $q.defer();
        Counties.query({},
          function (response) { return deferred.resolve(response); },
          function (err) { return deferred.reject(err); }
        );
        return deferred.promise;
      }
    }
  });
}]);
