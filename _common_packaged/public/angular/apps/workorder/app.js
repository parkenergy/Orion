angular.module('WorkOrderApp.Controllers', []);
angular.module('WorkOrderApp.Directives', []);
angular.module('WorkOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('WorkOrderApp', [
  'WorkOrderApp.Controllers',
  'WorkOrderApp.Directives',
  'WorkOrderApp.Services'
]);


angular.module('WorkOrderApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

  .when('/workorder/edit/:id?', {
    needsLogin: false,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit.html',
    resolve: {
      workorder: function($route, $q, WorkOrders) {
        //determine if we're creating or editing a workorder.
        var id = $route.current.params.id || 0;
        if (id) {
          var deffered = $q.defer();
          WorkOrders.get({id: id},
            function (response) { return deffered.resolve(response); },
            function (err) { return deffered.reject(err); }
          );
          return deffered.promise;
        } else {
          return null;
        }
      },
      units: function($route, $q, Units) {
        var deffered = $q.defer();
        Units.query({},
          function (response) {return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      customers: function($route, $q, Customers) {
        var deffered = $q.defer();
        Customers.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      users: function($route, $q, Users) {
        var deffered = $q.defer();
        Users.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      },
      parts: function($route, $q, Parts) {
        var deffered = $q.defer();
        Parts.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  })

  .when('/workorder', {
    needsLogin: false,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function($route, $q, WorkOrders) {
        var deffered = $q.defer();
        WorkOrders.query({},
          function (response) { return deffered.resolve(response); },
          function (err) { return deffered.reject(err); }
        );
        return deffered.promise;
      }
    }
  });
}]);

angular.module('WorkOrderApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);
