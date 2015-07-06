angular.module('CommonDirectives')
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
