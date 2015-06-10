angular.module('WorkOrderApp.Directives')

.directive('workorderBilling', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/header/woBilling.html',
    scope: true
  };
}]);
