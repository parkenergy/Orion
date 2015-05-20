angular.module('WorkOrderApp.Directives')

.directive('hardware', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/hardware.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);
