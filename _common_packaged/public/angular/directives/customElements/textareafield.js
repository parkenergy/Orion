angular.module('CommonDirectives')
.directive('textAreaField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/textareafield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      rows: '@'
    }
  };
}]);
