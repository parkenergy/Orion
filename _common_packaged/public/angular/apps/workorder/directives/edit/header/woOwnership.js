angular.module('WorkOrderApp.Directives')

.directive('workorderOwnership', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woOwnership.html',
    scope: true
  };
}]);
