angular.module('WorkOrderApp.Directives')

.directive('workorderHistory', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/woHistory.html',
    scope: true
  };
}]);
