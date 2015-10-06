angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsReadings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woEmissionsReadings.html',
    scope: true
  };
}]);
