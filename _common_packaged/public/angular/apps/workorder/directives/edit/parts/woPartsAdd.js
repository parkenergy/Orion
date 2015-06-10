angular.module('WorkOrderApp.Directives')

.directive('workorderPartsAdd', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/parts/woPartsAdd.html',
    scope: true
  };
}]);
