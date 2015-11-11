angular.module('WorkOrderApp.Directives')

.directive('reviewEngineLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woEngineLC.html',
    scope: true
  };
}]);
