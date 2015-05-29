angular.module('WorkOrderApp.Directives')

.directive('workorderPanelLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woPanelLC.html',
    scope: true
  };
}]);
