angular.module('WorkOrderApp.Directives')

.directive('reviewPartsAdd', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/woPartsAdd.html',
    scope: true
  };
}]);
