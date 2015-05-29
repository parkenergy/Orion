angular.module('Orion.Directives')
.directive('timeField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/timefield.html',
    scope: {
      labelText: '@',
      data: '=',
      hours: '=',
      minutes: '=',
    }
  };
}]);
