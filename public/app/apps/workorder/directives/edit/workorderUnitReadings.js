angular.module('WorkOrderApp.Directives')

.directive('workorderUnitReadings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/woUnitReadings.html',
    scope: true
  };
}]);
