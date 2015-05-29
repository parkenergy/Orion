angular.module('WorkOrderApp.Directives')

.directive('workorderEngineLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woEngineLC.html',
    scope: true
  };
}]);
