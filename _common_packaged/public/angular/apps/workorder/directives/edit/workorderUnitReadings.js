angular.module('WorkOrderApp.Directives')

.directive('workorderUnitReadings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/woUnitReadings.html',
    scope: true
  };
}]);
