angular.module('TransferApp.Directives')

.directive('transferReassignment', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferReassignment.html',
    scope: true,
  };
}]);
