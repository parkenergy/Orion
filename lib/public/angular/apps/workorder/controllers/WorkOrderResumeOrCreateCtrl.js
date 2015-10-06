angular.module('WorkOrderApp.Controllers').controller('WorkOrderResumeOrCreateCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
function ($scope, $route, $location, AlertService, LoaderService, workorders) {

  console.log("resumeorcreate");

  var resumeWorkOrderId = null;
  workorders.forEach(function (ele) {
    if (ele.timeSubmitted === null) { resumeWorkOrderId = ele._id; }
  });
  $location.path("/workorder/edit/" + (resumeWorkOrderId || ""));
  
}]);
