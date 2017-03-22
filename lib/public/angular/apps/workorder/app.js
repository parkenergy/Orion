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

  .when('/workorder/resumeorcreate', {
    needsLogin: true,
    controller: 'WorkOrderResumeOrCreateCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        return WorkOrders.query({});
      }
    }
  })

  .when('/workorder/review/:id?', {
    needsLogin: true,
    controller: 'WorkOrderReviewCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/review.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var id = $route.current.params.id || null;
        return (id) ? WorkOrders.get({id: id}) : null;
      },
      assettypes: function ($route, $q, AssetTypes) {
        return AssetTypes.query({});
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id || null;
        return (id) ? ReviewNotes.query({workOrder: id}) : null;
      },
      editHistories: function($route, $q, EditHistories){
        var id = $route.current.params.id || null;
        return (id) ? EditHistories.query({workOrder: id}) : null;
      },
      users: function ($route, $q, Users) {
        return Users.query({});
      },
      me: function ($route, $q, Users) {
        return Users.get({id: 'me'});
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        return ApplicationTypes.query({});
      },
      customers: function ($route, $q, Customers) {
        return Customers.query({});
      },
      counties: function ($route, $q, Counties) {
        return Counties.query({});
      },
      states: function ($route, $q, States) {
        return States.query({});
      },
      parts: function ($route, $q, Parts) {
        return Parts.query({});
      }
    }
  })

  .when('/workorder/edit/:id?', {
    needsLogin: true,
    controller: 'WorkOrderEditCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit.html',
    resolve: {
      workorder: function ($route, $q, WorkOrders) {
        var id = $route.current.params.id || null;
        return (id) ? WorkOrders.get({id: id}) : null;
      },
      assettypes: function ($route, $q, AssetTypes) {
        return AssetTypes.query({});
      },
      reviewNotes: function($route, $q, ReviewNotes){
        var id = $route.current.params.id || null;
        return (id) ? ReviewNotes.query({workOrder: id}) : null;
      },
      editHistories: function($route, $q, EditHistories){
        var id = $route.current.params.id || null;
        return (id) ? EditHistories.query({workOrder: id}) : null;
      },
      customers: function ($route, $q, Customers) {
        return Customers.query({});
      },
      users: function ($route, $q, Users) {
        return Users.query({});
      },
      me: function ($route, $q, Users) {
        return Users.get({id: 'me'});
      },
      parts: function ($route, $q, Parts) {
        return Parts.query({});
      },
      counties: function ($route, $q, Counties) {
        return Counties.query({});
      },
      states: function ($route, $q, States) {
        return States.query({});
      },
      applicationtypes: function ($route, $q, ApplicationTypes) {
        return ApplicationTypes.query({});
      },
      jsas: function ($route, $q, Jsas) {
        return Jsas.query({});
      }
    }
  })

  .when('/workorder', {
    needsLogin: true,
    controller: 'WorkOrderIndexCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/index.html',
    resolve: {
      workorders: function ($route, $q, WorkOrders) {
        return WorkOrders.query({});
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
