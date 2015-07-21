angular.module('CommonDirectives')
.directive('selectList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/selectlist.html',
    scope: {
      labelText: '@',
      data: '=',
      selectField: '@',
      displayField: '@',
      objList: '='
    }
  };
}]);
