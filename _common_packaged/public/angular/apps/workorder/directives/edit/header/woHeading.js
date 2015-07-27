angular.module('WorkOrderApp.Directives')

.directive('workorderHeading', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woHeading.html',
    scope: true
  };
}]);
