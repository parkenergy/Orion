angular.module('WorkOrderApp.Directives')

.directive('workorderEngineCompression', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woEngineCompression.html',
    scope: true
  };
}]);
