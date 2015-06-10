angular.module('CommonDirectives')

.directive('dashboard', ['$window', '$location', 'WorkOrders', function ($window, $location, WorkOrders) {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/dashboard.html',
    controller: "DashboardCtrl",
    scope: true
  };
}]);
