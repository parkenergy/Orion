angular.module('CommonDirectives')

.directive('dashboard', ['$window', '$location', 'WorkOrders', function ($window, $location, WorkOrders) {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/dashboard.html',
    controller: "DashboardCtrl",
    scope: true
  };
}]);
