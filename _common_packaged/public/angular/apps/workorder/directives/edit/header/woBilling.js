angular.module('WorkOrderApp.Directives')

.directive('workorderBilling', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woBilling.html',
    scope: true
  };
}]);
