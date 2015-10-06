angular.module('CommonDirectives')
.directive('priceField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/pricefield.html',
    scope: {
      labelText: '@',
      placeholderText: '@',
      data: '=',
      nonNegative: '@',
      integerOnly: '@',
    }
  };
}]);
