angular.module('CommonDirectives')

.directive('header', ['$window', '$location', function ($window, $location) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
        var user = scope.me || "Logged Out";
        return [
          {
          text: "User: " + user,
          action: function () { $location.path('/support'); }
          }
        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);
