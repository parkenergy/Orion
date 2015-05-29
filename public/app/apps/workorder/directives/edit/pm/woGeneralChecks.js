angular.module('WorkOrderApp.Directives')

.directive('workorderGeneralChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woGeneralChecks.html',
    scope: true
  };
}]);
