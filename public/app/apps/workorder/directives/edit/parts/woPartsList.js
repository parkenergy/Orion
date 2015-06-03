angular.module('WorkOrderApp.Directives')

.directive('workorderPartsList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/parts/woPartsList.html',
    scope: true
  };
}]);
