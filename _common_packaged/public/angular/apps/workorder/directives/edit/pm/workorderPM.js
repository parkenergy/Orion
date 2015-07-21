angular.module('WorkOrderApp.Directives')

.directive('workorderPm', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/pm/woPM.html',
    scope: true
  };
}]);
