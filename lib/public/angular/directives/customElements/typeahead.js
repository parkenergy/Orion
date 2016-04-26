angular.module('CommonDirectives')
.directive('typeAhead', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/typeahead.html',
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
