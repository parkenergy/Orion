angular.module('Orion.Directives')

.directive('dashboard', ['$window', '$location', 'WorkOrders', function ($window, $location, WorkOrders) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/dashboard.html',
    controller: "DashboardCtrl",
    scope: true
  };
}]);
