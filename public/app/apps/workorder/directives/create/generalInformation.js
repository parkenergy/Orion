angular.module('WorkOrderApp.Directives')

.directive('generalInformation', [function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: '/app/apps/workorder/views/generalInformation.html',
    controller: 'WorkOrderInformationCtrl'
  };
}]);
