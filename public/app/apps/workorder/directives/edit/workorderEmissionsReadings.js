angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsReadings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/woEmissionsReadings.html',
    scope: true
  };
}]);
