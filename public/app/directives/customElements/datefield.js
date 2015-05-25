angular.module('Orion.Directives')
.directive('dateField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/datefield.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
