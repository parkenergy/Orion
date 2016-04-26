angular.module('WorkOrderApp.Directives')

.directive('reviewComments', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woComments.html',
    scope: true
  };
}]);
