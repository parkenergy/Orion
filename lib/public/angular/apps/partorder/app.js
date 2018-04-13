angular.module('PartOrderApp.Controllers', []);
angular.module('PartOrderApp.Components', []);
angular.module('PartOrderApp.Directives', []);
angular.module('PartOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('PartOrderApp', [
  'PartOrderApp.Controllers',
  'PartOrderApp.Components',
  'PartOrderApp.Directives',
  'PartOrderApp.Services',
  'infinite-scroll'
]);

angular.module('PartOrderApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider

      .when('/partorder', {
        needsLogin: true,
        controller: 'PartOrderCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poOverview.html',
        resolve: {
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/review/:id',{
        needsLogin: true,
        controller: 'PartOrderReviewCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poReview.html',
        resolve: {
          partorder: function ($route, $q, PartOrders) {
            const id = $route.current.params.id || 0;
            return (id) ? PartOrders.get({id}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/editMany/:array', {
        needsLogin: true,
        controller: 'PartOrdersEditCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/posEdit.html',
        resolve: {
          partorders: function ($route, $q, PartOrder) {
            const ids = JSON.parse($route.current.params.array);
            return (ids) ? PartOrder.query({ids: ids}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/edit/:id',{
        needsLogin: true,
        controller: 'PartOrderEditCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poEdit.html',
        resolve: {
          partorder: function ($route, $q, PartOrders) {
            const id = $route.current.params.id || 0;
            return (id) ? PartOrders.get({id}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/create',{
        needsLogin: true,
        controller: 'PartOrderCreateCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poCreate.html',
        resolve: {
          parts: function ($route, $q, Parts) {
            return Parts.query({}).$promise;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      });
  }
]);

angular.module('PartOrderApp')
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

