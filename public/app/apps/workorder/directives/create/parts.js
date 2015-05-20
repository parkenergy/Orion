angular.module('WorkOrderApp.Directives')

.directive('parts', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/parts.html',
    controller: 'WorkOrderPartsCtrl'
  };
}]);
