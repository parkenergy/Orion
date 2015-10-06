angular.module('SupportApp.Controllers', []);
angular.module('SupportApp.Directives', []);
angular.module('SupportApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('SupportApp', [
  'SupportApp.Controllers',
  'SupportApp.Directives',
  'SupportApp.Services',
]);

angular.module('SupportApp').config(['$routeProvider',
  function($routeProvider){
  $routeProvider
  .when('/support', {
    needsLogin: true,
    controller: 'SupportIndexCtrl',
    templateUrl: '/lib/public/angular/apps/support/views/index.html',
    resolve:{}
  });
}]);

angular.module('SupportApp')
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
