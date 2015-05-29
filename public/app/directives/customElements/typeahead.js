angular.module('Orion.Directives')
.directive('typeAhead', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/typeahead.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      displayField: '@',
      objList: '=',
      limit: '@'
    }
  };
}]);
