angular.module('WorkOrderApp.Directives')

.directive('workorderHistory', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/woHistory.html',
    scope: true
  };
}]);
