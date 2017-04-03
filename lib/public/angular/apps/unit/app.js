angular.module('UnitApp.Controllers', []);
angular.module('UnitApp.Directives', []);
angular.module('UnitApp.Components', ['uiGmapgoogle-maps']);
angular.module('UnitApp.Services', ['ngResource', 'ngCookies']);

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

  .when('/unit', {
    controller: 'UnitIndexCtrl',
    templateUrl: '/lib/public/angular/apps/unit/views/index.html'
  });
}]);
