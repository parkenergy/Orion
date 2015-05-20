angular.module('Orion.Directives')

.directive('alerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/app/views/alerts.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.closeAlert = function (obj) {
      	return AlertService.closeAlert(obj);
      };
  	}
  };
}]);
