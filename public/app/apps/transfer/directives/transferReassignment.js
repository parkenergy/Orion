angular.module('TransferApp.Directives')

.directive('transferReassignment', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferReassignment.html',
    scope: true,
  };
}]);
