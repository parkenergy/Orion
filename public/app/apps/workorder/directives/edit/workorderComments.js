angular.module('WorkOrderApp.Directives')

.directive('workorderComments', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/woComments.html',
    scope: true
  };
}]);
