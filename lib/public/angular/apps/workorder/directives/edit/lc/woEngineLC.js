angular.module('WorkOrderApp.Directives')

.directive('workorderEngineLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woEngineLC.html',
    scope: true
  };
}]);
