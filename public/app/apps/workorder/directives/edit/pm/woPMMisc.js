angular.module('WorkOrderApp.Directives')

.directive('workorderPmMisc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/pm/woPMMisc.html',
    scope: true
  };
}]);
