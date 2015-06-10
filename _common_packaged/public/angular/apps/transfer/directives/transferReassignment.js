angular.module('TransferApp.Directives')

.directive('transferReassignment', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferReassignment.html',
    scope: true,
  };
}]);
