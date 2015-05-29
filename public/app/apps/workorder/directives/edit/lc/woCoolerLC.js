angular.module('WorkOrderApp.Directives')

.directive('workorderCoolerLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woCoolerLC.html',
    scope: true
  };
}]);
