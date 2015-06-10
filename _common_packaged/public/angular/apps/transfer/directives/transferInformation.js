angular.module('TransferApp.Directives')

.directive('transferInformation', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferInformation.html',
    scope: true,
    controller: 'TransferInformationCtrl'
  };
}]);
