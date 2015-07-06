angular.module('CommonDirectives')
.directive('checkBox', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/checkbox.html',
    scope: {
      labelText: '@',
      data: '='
    }
  };
}]);
