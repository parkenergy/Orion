angular.module('Orion.Directives')
.directive('textField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/textfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
