angular.module('Orion.Directives')

.directive('header', ['$window', '$location', function ($window, $location) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
      	var navItems = [];
      	if ($location.path() === "/") {
      		navItems = [
      			{
      				text: "Login",
      				action: function () { $location.path('/myaccount'); }
      			}
      		];
      	} else {
      		navItems = [
      			{
      				text: "My Account",
      				action: function () { $location.path('/myaccount'); }
      			},
      			{
      				text: "Logout",
      				action: function () { $window.location = 'logout'; }
      			}
      		];
      	}
      	return navItems;
      }

      scope.navItems = getnavItems();
  	}
  };
}]);
