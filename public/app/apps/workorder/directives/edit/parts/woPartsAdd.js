angular.module('WorkOrderApp.Directives')

.directive('workorderPartsAdd', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/parts/woPartsAdd.html',
    scope: true
  };
}]);
