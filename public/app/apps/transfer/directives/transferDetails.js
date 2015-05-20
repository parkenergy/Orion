angular.module('TransferApp.Directives')

.directive('transferDetails', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferDetails.html',
    scope: true,
    controller: 'TransferDetailsCtrl'
  };
}]);
