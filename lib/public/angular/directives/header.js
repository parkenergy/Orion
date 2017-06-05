angular.module('CommonDirectives')

.directive('header', ['$window', '$location', '$cookies', function ($window, $location, $cookies) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
        return [
          {
          text: "User: " + $cookies.get('tech') || "Logged Out",
          action: function () { $location.path('/support'); }
          }
        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);
