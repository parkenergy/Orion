angular.module('WorkOrderApp.Directives')

.directive('workorderKillSettings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woKillSettings.html',
    scope: true
  };
}]);
