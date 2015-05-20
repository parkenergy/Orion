angular.module('WorkOrderApp.Directives')

.directive('logs', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/logs.html',
    controller: 'WorkOrderLogsCtrl'
  };
}]);
