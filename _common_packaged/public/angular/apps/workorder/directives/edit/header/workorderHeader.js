angular.module('WorkOrderApp.Directives')

.directive('workorderHeader', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/workorderheader.html',
    scope: true
  };
}]);
