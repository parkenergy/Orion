angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woEmissionsLC.html',
    scope: true
  };
}]);
