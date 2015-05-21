angular.module('Orion.Directives')
.directive('priceField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/pricefield.html',
    scope: {
      labelText: '@',
      placeholderText: '@',
      data: '=',
      nonNegative: '@',
      integerOnly: '@',
    }
  };
}]);
