angular.module('WorkOrderApp.Directives')

.directive('reviewParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/reviewParts.html',
    scope: true
  };
}]);