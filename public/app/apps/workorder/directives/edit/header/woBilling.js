angular.module('WorkOrderApp.Directives')

.directive('workorderBilling', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/woBilling.html',
    scope: true
  };
}]);
