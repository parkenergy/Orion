angular.module('WorkOrderApp.Directives')

.directive('workorderBasicLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woBasicLC.html',
    scope: true
  };
}]);
