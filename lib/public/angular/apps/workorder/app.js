angular.module('WorkOrderApp.Controllers', []);
angular.module('WorkOrderApp.Components', []);
angular.module('WorkOrderApp.Directives', ['uiGmapgoogle-maps']);
angular.module('WorkOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('WorkOrderApp', [
  'WorkOrderApp.Controllers',
  'WorkOrderApp.Components',
  'WorkOrderApp.Directives',
  'WorkOrderApp.Services',
  'infinite-scroll'
]);

angular.module('WorkOrderApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

      .when('/workorder', {
    needslogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
      STARTTIME: () => null,
      ENDTIME: () => null,
      WOTYPE: () => null,
      TECHNICIANID: () => null,
    }
  })
      .when('/workorder/v1Search/:startTime/:technicianID/:Type?', {
    needsLogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
      STARTTIME: function ($route) {
        return new Date($route.current.params.startTime) || null;
      },
      ENDTIME: () => null,
      WOTYPE: function ($route) {
        return $route.current.params.Type || null;
      },
      TECHNICIANID: function ($route) {
        return $route.current.params.technicianID || null;
      },
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
    }
  })
      .when('/workorder/v2Search/:startTime/:endTime/:technicianID', {
    needsLogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
      STARTTIME: function ($route) {
        return new Date($route.current.params.startTime) || null;
      },
      ENDTIME: function ($route) {
        return new Date($route.current.params.endTime) || null;
      },
      WOTYPE: () => null,
      TECHNICIANID: function ($route) {
        return $route.current.params.technicianID || null;
      },
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
    }
  })
      .when('/workorder/view/:id?', {
          needsLogin: true, controller: 'WorkOrderViewCtrl',
          templateUrl: '/lib/public/angular/apps/workorder/views/view.html', resolve: {
              me: function ($route, $q, Users) {
                  return Users.get({id: 'me'}).$promise;
              },
              workorder: function ($route, $q, WorkOrders) {
                  const id = $route.current.params.id || null;
                  return (id) ? WorkOrders.get({id: id}).$promise : null;
              },
          }
      })
      .when('/workorder/create', {
          needsLogin:  true,
          controller:  'WorkOrderCreateCtrl',
          templateUrl: '/lib/public/angular/apps/workorder/views/create.html',
          resolve:     {
              me: function ($route, $q, Users) {
                  return Users.get({id: 'me'}).$promise
              },
          },
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
