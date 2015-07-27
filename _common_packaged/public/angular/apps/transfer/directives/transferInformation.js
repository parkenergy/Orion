angular.module('TransferApp.Directives')

.directive('transferInformation', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferInformation.html',
    scope: true,
    controller: 'TransferInformationCtrl'
  };
}]);
