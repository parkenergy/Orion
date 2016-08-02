angular.module('WorkOrderApp.Directives')

.directive('reviewInfo', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woInfo.html',
    scope: true
  };
}]);
