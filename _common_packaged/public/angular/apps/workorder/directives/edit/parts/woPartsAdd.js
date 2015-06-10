angular.module('WorkOrderApp.Directives')

.directive('workorderPartsAdd', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/parts/woPartsAdd.html',
    scope: true
  };
}]);
