angular.module('WorkOrderApp.Directives')

.directive('workorderBasicLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/lc/woBasicLC.html',
    scope: true
  };
}]);
