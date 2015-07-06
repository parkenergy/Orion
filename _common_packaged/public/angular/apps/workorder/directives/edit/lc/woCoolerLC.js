angular.module('WorkOrderApp.Directives')

.directive('workorderCoolerLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/lc/woCoolerLC.html',
    scope: true
  };
}]);
