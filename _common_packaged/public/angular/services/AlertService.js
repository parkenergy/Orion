angular.module('CommonServices')
.factory('AlertService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

  var AlertService = {};
  // create an array of alerts available globally
  $rootScope.alerts = [];

  AlertService.add = function (type, message, timeout) {
    if(!timeout) { timeout = 5000; }
    if (timeout < 100) { timeout *= 1000; }
    var alert = {'type': type, 'message': message};
    $rootScope.alerts.push(alert);
    $timeout(function () {
      AlertService.closeAlert(alert);
    }, timeout);
  };

  AlertService.closeAlert = function (alert) {
    var indexOfAlert = $rootScope.alerts.indexOf(alert);
    AlertService.closeAlertIndex(indexOfAlert);
  };

  AlertService.closeAlertIndex = function (index) {
    $rootScope.alerts.splice(index, 1);
  };

  return AlertService;

}]);
