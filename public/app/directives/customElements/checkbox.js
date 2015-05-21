angular.module('Orion.Directives')
.directive('checkBox', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/checkbox.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
