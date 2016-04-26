angular.module('WorkOrderApp.Directives')

.directive('reviewOwnership', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woOwnership.html',
    scope: true
  };
}]);
