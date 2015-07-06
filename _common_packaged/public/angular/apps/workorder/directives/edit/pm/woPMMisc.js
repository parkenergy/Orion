angular.module('WorkOrderApp.Directives')

.directive('workorderPmMisc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/pm/woPMMisc.html',
    scope: true
  };
}]);
