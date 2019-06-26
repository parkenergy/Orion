angular.module('WorkOrderApp.Directives')

.directive('reviewUnitReadings', [function () {
  return {
    restrict: 'E', templateUrl: '/lib/public/angular/apps/workorder/views/review/alt-woUnitReadings.html',
    scope: true
  };
}]);
