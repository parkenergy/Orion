angular.module('WorkOrderApp.Directives')

.directive('workorderPm', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woPM.html',
    scope: true
  };
}]);
