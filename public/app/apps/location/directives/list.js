angular.module('TransferApp.Directives')

.directive('locationList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/location/views/list.html',
    link: function (scope, elem, attrs, ctrl, $location) {

    }
  };
}]);
