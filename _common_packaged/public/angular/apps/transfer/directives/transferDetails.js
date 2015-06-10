angular.module('TransferApp.Directives')

.directive('transferDetails', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferDetails.html',
    scope: true,
    controller: 'TransferDetailsCtrl'
  };
}]);
