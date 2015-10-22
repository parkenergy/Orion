angular.module('WorkOrderApp.Controllers').controller('WorkOrderIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
function ($scope, $route, $location, AlertService, LoaderService, workorders) {

  $scope.title = "Work Orders";

  $scope.workorders = workorders;

  $scope.fixCustomerName = function(){
    angular.forEach($scope.workorders, function(wo){
      if(!wo.customerName) wo.customerName = '';
    });
  };
  $scope.fixCustomerName();

  $scope.columns = [
    {title: "Unit", objKey: "unitNumber"},
    {title: "Customer", objKey: "customerName"},
    {title: "Date", objKey: "timeStarted"},
    {title: "Technician Id", objKey: "techId"}
  ];

}]);
