angular.module('CommonDirectives')
.directive('dateField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/datefield.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
