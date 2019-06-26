angular.module('WorkOrderApp.Directives')

.directive('workorderUnitReadings', [function () {
  return {
    restrict: 'E', templateUrl: '/lib/public/angular/apps/workorder/views/edit/alt-woUnitReadings.html',
    scope: true
  };
}]);
