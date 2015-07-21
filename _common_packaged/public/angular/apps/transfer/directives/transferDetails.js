angular.module('TransferApp.Directives')

.directive('transferDetails', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferDetails.html',
    scope: true,
    controller: 'TransferDetailsCtrl'
  };
}]);
