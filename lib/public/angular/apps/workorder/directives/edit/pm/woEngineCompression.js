angular.module('WorkOrderApp.Directives')

.directive('workorderEngineCompression', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woEngineCompression.html',
    scope: true
  };
}]);
