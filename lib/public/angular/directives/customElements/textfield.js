angular.module('CommonDirectives')
.directive('textField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/textfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
