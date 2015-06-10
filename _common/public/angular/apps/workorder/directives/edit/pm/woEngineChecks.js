angular.module('WorkOrderApp.Directives')

.directive('workorderEngineChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/pm/woEngineChecks.html',
    scope: true
  };
}]);
