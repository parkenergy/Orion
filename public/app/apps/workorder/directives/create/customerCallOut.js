angular.module('WorkOrderApp.Directives')

.directive('customerCallOut', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/customerCallOut.html',
    controller: 'WorkOrderCalloutCtrl',
    scope: true
  };
}]);
