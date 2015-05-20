angular.module('WorkOrderApp.Controllers').controller('WorkOrderCalloutCtrl',
['$scope', 'AlertService',
  function ($scope, AlertService) {

  $scope.callOutReasons =  [
    "PRODUCTION RELATED",
    "ELECTRICAL ISSUES",
    "MECHANICAL-ENGINE",
    "MECHANICAL-COMPRESSOR"
  ];

}]);
