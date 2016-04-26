angular.module('WorkOrderApp.Directives')

.directive('reviewCoolerLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woCoolerLC.html',
    scope: true
  };
}]);
