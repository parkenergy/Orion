angular.module('WorkOrderApp.Directives')

.directive('reviewPmMisc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woPMMisc.html',
    scope: true
  };
}]);
