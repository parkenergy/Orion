angular.module('WorkOrderApp.Directives')

.directive('workorderType', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woType.html',
    scope: true
  };
}]);
