angular.module('WorkOrderApp.Directives')

.directive('workorderComments', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/woComments.html',
    scope: true
  };
}]);
