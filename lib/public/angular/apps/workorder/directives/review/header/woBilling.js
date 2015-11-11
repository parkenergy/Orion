angular.module('WorkOrderApp.Directives')

.directive('reviewBilling', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woBilling.html',
    scope: true
  };
}]);
