angular.module('CommonDirectives')

.directive('header', ['$window', '$location', function ($window, $location) {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      var num = 0;

      function getnavItems() {
        return [
    			{
    				text: "Support",
    				action: function () { $location.path('/support'); }
    			},
          {
            text: "Sync (" + num + ")",
            action: function () { $location.path('/support'); }
          }
        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);
