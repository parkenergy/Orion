angular.module('WorkOrderApp.Directives')

.directive('workorderType', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/header/woType.html',
    scope: true
  };
}]);
