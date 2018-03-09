angular.module('WorkOrderApp.Directives')
.directive('newSerialNumbers', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/newSerial.html',
    scope: true
  };
}]);
