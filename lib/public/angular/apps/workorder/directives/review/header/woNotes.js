angular.module('WorkOrderApp.Directives')

.directive('reviewNotes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woNotes.html',
    scope: true
  };
}]);
