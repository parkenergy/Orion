angular.module('WorkOrderApp.Directives')

.directive('workorderEngineChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woEngineChecks.html',
    scope: true
  };
}]);
