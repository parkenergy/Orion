angular.module('CommonDirectives')
.directive('textField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/textfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
