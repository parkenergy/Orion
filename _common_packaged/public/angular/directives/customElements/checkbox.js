angular.module('CommonDirectives')
.directive('checkBox', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/checkbox.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
