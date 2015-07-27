angular.module('CommonDirectives')
.directive('textAreaField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/textareafield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      rows: '@'
    }
  };
}]);
