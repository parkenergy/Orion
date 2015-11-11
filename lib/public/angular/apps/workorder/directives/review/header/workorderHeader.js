angular.module('WorkOrderApp.Directives')

.directive('reviewHeader', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/reviewheader.html',
    scope: true
  };
}]);
