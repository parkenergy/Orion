angular.module('TransferApp.Directives')

.directive('transferInformation', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferInformation.html',
    scope: true,
    controller: 'TransferInformationCtrl'
  };
}]);
