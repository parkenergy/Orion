angular.module('WorkOrderApp.Directives')

.directive('workorderEngineCompression', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/pm/woEngineCompression.html',
    scope: true
  };
}]);
