angular.module('WorkOrderApp.Directives')

.directive('workorderLaborCodes', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/workorderLaborCodes.html',
    scope: true
  };
}]);
