angular.module('PaidTimeOffApp.Controllers', []);
angular.module('PaidTimeOffApp.Components', []);
angular.module('PaidTimeOffApp.Directives', []);
angular.module('PaidTimeOffApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('PaidTimeOffApp', [
  'PaidTimeOffApp.Controllers',
  'PaidTimeOffApp.Components',
  'PaidTimeOffApp.Directives',
  'PaidTimeOffApp.Services',
  'infinite-scroll'
]);

angular.module('PaidTimeOffApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider

      .when('/paidtimeoff', {
        needsLogin: true,
        controller: 'PaidTimeOffCtrl',
        templateUrl: '/lib/public/angular/apps/paidtimeoff/views/ptoOverview.html',
      })
      .when('/paidtimeoff/review/:id',{
        needsLogin: true,
        controller: 'PaidTimeOffReviewCtrl',
        templateUrl: '/lib/public/angular/apps/paidtimeoff/views/ptoReview.html',
        resolve: {
          paidtimeoff: function ($route, $q, PaidTimeOffs) {
            const id = $route.current.params.id || 0;
            return (id) ? PaidTimeOffs.get({id}).$promise : null;
          }
        }
      });
      /*.when('/paidtimeoff/create',{
        needsLogin: true,
        controller: 'PaidTimeOffCreateCtrl',
        templateUrl: '/lib/public/angular/apps/paidtimeoff/views/ptoCreate.html',
      });*/
  }
]);

angular.module('PaidTimeOffApp')
  .run(['$route', '$rootScope', '$location',
    function($route, $rootScope, $location) {
      var original = $location.path;
      $location.path = function(path, reload) {
        if (reload === false) {
          var lastRoute = $route.current;
          var un = $rootScope.$on('$locationChangeSuccess', function() {
            $route.current = lastRoute;
            un();
          });
        }
        return original.apply($location, [path]);
      };
    }
  ]);

