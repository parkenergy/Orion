angular.module('WorkOrderApp.Directives')

.directive('workorderPanelLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woPanelLC.html',
    scope: true
  };
}]);
