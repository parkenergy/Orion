angular.module('WorkOrderApp.Directives')

.directive('workorderParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/parts/workorderParts.html',
    scope: true
  };
}]);
