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

      .when('/workorder/review/:id?', {
    needsLogin: true,
    controller: 'WorkOrderReviewCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/review.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var id = $route.current.params.id || null;
        return (id) ? WorkOrders.get({id: id}).$promise : null;
      },
      woInputMatrixes: function ($route, $q, WoUnitInputMatrixes){
        return WoUnitInputMatrixes.query({}).$promise
      },
      engineModels: function ($route, $q, EngineModels) {
        return EngineModels.query({}).$promise
      },
      frameModels: function ($route, $q, FrameModels) {
        return FrameModels.query({}).$promise
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id || null;
        return (id) ? ReviewNotes.query({workOrder: id}).$promise : null;
      },
      editHistories: function($route, $q, EditHistories){
        var id = $route.current.params.id || null;
        return (id) ? EditHistories.query({workOrder: id}).$promise : null;
      },
      me: function ($route, $q, Users) {
        return Users.get({id: 'me'}).$promise;
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        return ApplicationTypes.query({}).$promise;
      },
      parts: function ($route, $q, Parts) {
        return Parts.query({}).$promise;
      },
      locations: function ($route, $q, Locations) {
        return Locations.query({}).$promise;
      },
      states: function ($route, $q, States) {
          return States.query({}).$promise
      },
      counties: function ($route, $q, Counties) {
          return Counties.query({}).$promise
      }
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
      })
      .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var id = $route.current.params.id || null;
        return (id) ? WorkOrders.get({id: id}).$promise : null;
      },
      woInputMatrixes: function ($route, $q, WoUnitInputMatrixes){
        return WoUnitInputMatrixes.query({}).$promise
      },
      engineModels: function ($route, $q, EngineModels) {
        return EngineModels.query({}).$promise
      },
      frameModels: function ($route, $q, FrameModels) {
        return FrameModels.query({}).$promise
      },
      assettypes: function ($route, $q, AssetTypes) {
        return AssetTypes.query({}).$promise;
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id || null;
        return (id) ? ReviewNotes.query({workOrder: id}).$promise : null;
      },
      editHistories: function($route, $q, EditHistories){
        var id = $route.current.params.id || null;
        return (id) ? EditHistories.query({workOrder: id}).$promise : null;
      },
      me: function ($route, $q, Users) {
        return Users.get({id: 'me'}).$promise;
      },
      parts: function ($route, $q, Parts) {
        return Parts.query({}).$promise;
      },
        states: function ($route, $q, States) {
            return States.query({}).$promise
        },
        counties: function ($route, $q, Counties) {
            return Counties.query({}).$promise
        },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        return ApplicationTypes.query({}).$promise;
      },
      locations: function ($route, $q, Locations) {
        return Locations.query({}).$promise;
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
