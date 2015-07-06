angular.module('CommonDirectives')
.directive('dateField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/datefield.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
