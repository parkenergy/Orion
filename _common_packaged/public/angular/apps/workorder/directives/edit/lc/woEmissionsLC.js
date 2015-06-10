angular.module('WorkOrderApp.Directives')

.directive('workorderEmissionsLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/lc/woEmissionsLC.html',
    scope: true
  };
}]);
