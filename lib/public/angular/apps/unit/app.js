angular.module('UnitApp.Controllers', []);
angular.module('UnitApp.Directives', ['uiGmapgoogle-maps']);
angular.module('UnitApp.Components', []);
angular.module('UnitApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('UnitApp', [
  'UnitApp.Controllers',
  'UnitApp.Directives',
  'UnitApp.Services',
  'UnitApp.Components'
]);


angular.module('UnitApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

    .when('/unit/view/:id?', {
      controller: 'UnitViewCtrl',
      templateUrl: '/lib/public/angular/apps/unit/views/view.html',
      resolve: {
        unit: function ($route, $q, Units) {
          return Units.get({id: $route.current.params.id}).$promise;
        }
      }
    })

    .when('/unit/page/:coords?', {
      controller: 'UnitPageCtrl',
      templateUrl: '/lib/public/angular/apps/unit/views/page.html',
      resolve: {
        coords: function ($route) {
          const coords = $route.current.params.coords.split(',');
          return [+coords[1], +coords[0]];
        }
      }
    })

    .when('/unit', {
      controller: 'UnitIndexCtrl',
      templateUrl: '/lib/public/angular/apps/unit/views/index.html'
    });
}]);
