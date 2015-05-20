angular.module('WorkOrderApp.Directives')

.directive('pressure', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/pressure.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);
