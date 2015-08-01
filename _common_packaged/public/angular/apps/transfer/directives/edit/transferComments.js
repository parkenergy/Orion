angular.module('TransferApp.Directives')

.directive('transferComments', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/edit/transferComments.html',
    scope: true
  };
}]);
