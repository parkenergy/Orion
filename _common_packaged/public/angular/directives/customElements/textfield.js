angular.module('CommonDirectives')
.directive('textField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/textfield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@'
    }
  };
}]);
