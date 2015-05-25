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
    templateUrl: '/app/apps/part/views/edit.html',
    resolve: {
      part: function($route, $q, Parts) {
        //determine if we're creating or editing a part.
        var id = $route.current.params._id || 0;
        if (id) {
          var deffered = $q.defer();
          Parts.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      vendors: function ($route, $q, Vendors) {
        var deffered = $q.defer();
        Vendors.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      role: function($route, $q, role) {
        return role.get();
      }
    }
  })

  .when('/part', {
    controller: 'PartIndexCtrl',
    templateUrl: '/app/apps/part/views/index.html',
    resolve: {
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
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
