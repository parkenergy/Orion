angular.module('TransferApp.Directives')

.directive('transferDetail', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/edit/transferDetails.html',
    scope: true
  };
}]);
