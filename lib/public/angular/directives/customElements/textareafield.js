angular.module('CommonDirectives')
.directive('textAreaField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/textareafield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      rows: '@'
    }
  };
}]);
