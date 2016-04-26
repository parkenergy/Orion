angular.module('WorkOrderApp.Directives')

.directive('reviewEngineChecks', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woEngineChecks.html',
    scope: true
  };
}]);
