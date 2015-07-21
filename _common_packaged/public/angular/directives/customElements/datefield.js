angular.module('CommonDirectives')
.directive('dateField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/datefield.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
