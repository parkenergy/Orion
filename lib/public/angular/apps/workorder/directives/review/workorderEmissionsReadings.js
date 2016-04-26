angular.module('WorkOrderApp.Directives')

.directive('reviewEmissionsReadings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woEmissionsReadings.html',
    scope: true
  };
}]);
