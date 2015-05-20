angular.module('TransferApp.Directives')

.directive('transferSimple', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferSimple.html',
    scope: true,
  };
}]);
