angular.module('CommonDirectives')

.directive('alerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/alerts.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.closeAlert = function (obj) {
      	return AlertService.closeAlert(obj);
      };
  	}
  };
}]);
