angular.module('TransferApp.Directives')

.directive('transferYard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferYard.html',
    scope: true,
  };
}]);
