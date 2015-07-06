angular.module('CommonDirectives')
.directive('timeField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/views/customElements/timefield.html',
    scope: {
      labelText: '@',
      data: '=',
      hours: '=',
      minutes: '=',
    }
  };
}]);
