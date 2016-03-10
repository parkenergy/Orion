angular.module('CommonControllers').controller('DashboardCtrl',
  ['$scope', '$route', '$location', 'AlertService', 'LoaderService',
    function ($scope, $route, $location, AlertService, LoaderService) {

      $scope.lookup = function(obj) {
        $scope.WorkOrderLookup(obj).then(
          function(workorders) {
            $scope.workorders = workorders.map(mapWorkorders);
          },
          function(reason){
            alert("WorkOrder Lookup Failed");
            console.log("Failure: ", reason);
          }
        )
      };

      $scope.dateFilter = function(from, to) {
        $scope.lookup({from: from, to: to});
      };

      $scope.workorders = workorders.map(mapWorkorders);

      $scope.orderByField = 'epoch';
      $scope.reverseSort = true;
      $scope.searchWorkorders = {};

      $scope.createWorkOrder = function () {
        $location.path('/workorder/create');
      };

      $scope.resort = function(by) {
        $scope.orderByField = by;
        $scope.reverseSort = !$scope.reverseSort;
        //console.log($scope.orderByField);
        //console.log($scope.reverseSort);
      };



      $scope.clickWorkOrder = function() {
        var wo = this.workorder;
        $scope.selected = wo;
        console.log(wo);

        $location.url('/workorder/review/' + wo._id);
      };

      $scope.redirectToReview = function(id){
        $location.url('http://localhost:3000/#/workorder/review/' + id);
      };

      // $scope.changeSorting = function (column) {
      //   var sort = $scope.sort;
      //   if (sort.column == column) {
      //     sort.descending = !sort.descending;
      //   } else {
      //     sort.column = column;
      //     sort.descending = false;
      //   }
      // };

      $scope.lookup(obj);
    }]);

var from = $('input[name="startdate"]').val($.datepicker.formatDate('mm/dd/yy', new Date()));
var to = $('input[name="enddate"]').val($.datepicker.formatDate('mm/dd/yy', new Date()));

//Set fields and sanity checks
function mapWorkorders(wo){
  if(wo.unitNumber) wo.unitSort = Number(wo.unitNumber.replace(/\D+/g, ''));
  else wo.unitSort = 0;

  if(wo.header) {
    if (!wo.header.customerName) wo.header.customerName = '';
    wo.customerName = wo.header.customerName;
    wo.locationName = wo.header.leaseName;
  }
  else {
    wo.customerName = '';
    wo.locationName = '';
  }

  wo.epoch = new Date(wo.updated_at).getTime();
  var displayName = "";
  if (!wo.unit || !wo.unit.location || !wo.unit.location.name) {
    // do nothing
  } else if (wo.unit.location.name.length <= 20) {
    wo.displayLocationName = wo.unit.location.name;
  } else {
    wo.displayLocationName = wo.unit.location.name.slice(0,17) + "...";
  }
  return wo;
}
