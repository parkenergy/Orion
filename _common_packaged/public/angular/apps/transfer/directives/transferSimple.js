angular.module('TransferApp.Directives')

.directive('transferSimple', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferSimple.html',
    scope: true,
  };
}]);
