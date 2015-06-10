angular.module('WorkOrderApp.Directives')

.directive('workorderComments', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/woComments.html',
    scope: true
  };
}]);
