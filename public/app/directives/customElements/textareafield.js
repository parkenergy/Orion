angular.module('Orion.Directives')
.directive('textAreaField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/textareafield.html',
    scope: {
      labelText: '@',
      data: '=',
      placeholderText: '@',
      rows: '@'
    }
  };
}]);
