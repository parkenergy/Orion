angular.module('WorkOrderApp.Directives')

.directive('workorderParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/parts/workorderParts.html',
    scope: true
  };
}]);
