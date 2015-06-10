angular.module('CommonDirectives')
.directive('timeField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/views/customElements/timefield.html',
    scope: {
      labelText: '@',
      data: '=',
      hours: '=',
      minutes: '=',
    }
  };
}]);
