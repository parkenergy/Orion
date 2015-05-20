angular.module('TransferApp.Directives')

.directive('transferLocationCreate', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferLocationCreate.html',
    scope: true,
  };
}]);
