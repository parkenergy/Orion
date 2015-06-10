angular.module('CommonDirectives')
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
