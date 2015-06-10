angular.module('CommonDirectives')
.directive('selectList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/selectlist.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      displayField: '@',
      objList: '='
    }
  };
}]);
