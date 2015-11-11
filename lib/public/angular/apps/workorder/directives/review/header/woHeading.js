angular.module('WorkOrderApp.Directives')

.directive('reviewHeading', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woHeading.html',
    scope: true
  };
}]);
