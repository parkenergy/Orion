angular.module('WorkOrderApp.Directives')

.directive('editNotes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woNotes.html',
    scope: true
  };
}]);
