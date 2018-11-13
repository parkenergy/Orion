angular.module('WorkOrderApp.Directives')

.directive('sopChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woSOPChecks.html',
    scope: true
  };
}]);
