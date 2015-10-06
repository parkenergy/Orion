angular.module('CommonDirectives')
.directive('checkBox', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/checkbox.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
