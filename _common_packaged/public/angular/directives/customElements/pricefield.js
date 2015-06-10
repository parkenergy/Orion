angular.module('CommonDirectives')
.directive('priceField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/pricefield.html',
    scope: {
      labelText: '@',
      placeholderText: '@',
      data: '=',
      nonNegative: '@',
      integerOnly: '@',
    }
  };
}]);
