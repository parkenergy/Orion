angular.module('CommonDirectives')
.directive('timeField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/customElements/timefield.html',
    scope: {
      show: '=',
      labelText: '@',
      data: '=',
      hours: '=',
      minutes: '=',
      disabled: '='
    }
  };
}]);
