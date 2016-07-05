angular.module('CommonDirectives')

.directive('header', ['$window', '$location', function ($window, $location) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      var tech;

      function getnavItems() {
        return [
          {
          text: "User: " + tech,
          action: function () { $location.path('/support'); }
          },
    			{
    				text: "Support",
    				action: function () { $location.path('/support'); }
    			},

        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);
