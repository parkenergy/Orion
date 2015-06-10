angular.module('WorkOrderApp.Directives')

.directive('workorderCoolerLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/lc/woCoolerLC.html',
    scope: true
  };
}]);
