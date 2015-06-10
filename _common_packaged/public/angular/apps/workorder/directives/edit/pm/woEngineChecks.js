angular.module('WorkOrderApp.Directives')

.directive('workorderEngineChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/pm/woEngineChecks.html',
    scope: true
  };
}]);
