angular.module('WorkOrderApp.Directives')

.directive('reviewEngineCompression', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woEngineCompression.html',
    scope: true
  };
}]);
