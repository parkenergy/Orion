angular.module('Orion.Directives')
.directive('selectList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/views/customElements/selectlist.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      displayField: '@',
      objList: '='
    }
  };
}]);
