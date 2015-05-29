angular.module('WorkOrderApp.Directives')

.directive('workorderHistory', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/woHistory.html',
    scope: true
  };
}]);
