angular.module('Orion.Directives')
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
