angular.module('WorkOrderApp.Directives')

.directive('workorderPmMisc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/pm/woPMMisc.html',
    scope: true
  };
}]);
