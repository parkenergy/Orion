angular.module('WorkOrderApp.Directives')

.directive('workorderPanelLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/lc/woPanelLC.html',
    scope: true
  };
}]);
