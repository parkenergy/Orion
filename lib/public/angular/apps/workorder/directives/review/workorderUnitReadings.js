angular.module('WorkOrderApp.Directives')

.directive('reviewUnitReadings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woUnitReadings.html',
    scope: true
  };
}]);
