angular.module('WorkOrderApp.Directives')

.directive('reviewPanelLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woPanelLC.html',
    scope: true
  };
}]);
