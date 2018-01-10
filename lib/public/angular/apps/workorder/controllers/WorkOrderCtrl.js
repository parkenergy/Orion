angular.module('WorkOrderApp.Controllers').controller('WorkOrderCtrl',
['$window','$location','$scope','SessionService','ApiRequestService','AlertService','$http', 'STARTTIME', 'ENDTIME', 'WOTYPE', 'TECHNICIANID', function ($window,$location,$scope,SessionService,ApiRequestService,AlertService,$http, STARTTIME, ENDTIME, WOTYPE, TECHNICIANID) {
  // Variables-------------------------------------------
  const SS =  SessionService;                 // local
  const ARS = ApiRequestService;              // local
  $scope.spinner = true;                      // local
  $scope.loaded = true;                       // local
  $scope.WOSearchCount = 0;                   // to OverviewTable
  $scope.reportDisabled = false;              // to OverviewTable
  $scope.STARTTIME = STARTTIME;     // to OverviewTable
  $scope.ENDTIME = ENDTIME;         // to OverviewTable
  $scope.WOTYPE = WOTYPE;                     // to OverviewTable
  $scope.TECHNICIANID = TECHNICIANID;         // to OverviewTable
  // ----------------------------------------------------
  
  // Clear unit parameter from service when routing away from /myaccount
  $window.onhashchange = () => SS.drop("unitNumber");
  
  // Turn Spinner on and off
  $scope.spinnerOff = function (){
    $scope.spinner = false;
  };
  $scope.spinnerOn = function () {
    $scope.spinner = true;
  };
  // ----------------------------------------------------
  
  // Passed to Component --------------------------------
  // Function called any time page loads or user scrolls
  $scope.lookup = (query) => {
    const queryParams = $location.search();
  
    if(queryParams.unit) {
      obj.unit = queryParams;
    }
  
    $scope.loaded = false;
    $scope.spinnerOn();
    console.log(SS.get('unitNumber'))
    if(SS.get("unitNumber")) {
      ARS.http.get.UnitWorkOrders(query)
        .then((res) => {
          $scope.workorders = res.data.map(mapWorkorders);
          $scope.loaded = true;
          $scope.spinnerOff();
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
      ARS.http.get.WorkOrdersNoIdentityCount(query)
        .then((res) => {
          $scope.WOSearchCount = res.data;
        }, (err) => {
          console.log(`Counting Error: ${err}`);
        });
    } else {
      // load workorders based on query
      ARS.WorkOrders(query)
        .then((res) => {
          $scope.workorders = res.map(mapWorkorders);
          $scope.loaded = true;
          $scope.spinnerOff();
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
      // get count of the same query
      ARS.http.get.WorkOrderCount(query)
        .then((res) => {
          $scope.WOSearchCount = res.data;
        }, (err) => {
          console.log(`Counting Error: ${err}`);
        });
    }
  };
  
  $scope.WorkOrderScrollLookup = (query) => {
    if(SS.get("unitNumber")) {
      ARS.http.get.UnitWorkOrders(query)
        .then((res) => {
          const wo = res.data.map(mapWorkorders);
          $scope.workorders = $scope.workorders.concat(wo);
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
    } else {
      ARS.WorkOrders(query)
        .then((res) => {
          const wo = res.map(mapWorkorders);
          $scope.workorders = $scope.workorders.concat(wo);
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
    }
  };
  
  $scope.WorkORderReport = (query) => {
    $http({method: 'GET',url: '/api/workorders', params: query})
      .then((resp) => {
        const anchor = angular.element('<a/>');
        anchor.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(resp.data),
          target: '_blank',
          download: 'timeReport.csv'
        })[0].click();
        $scope.reportDisabled = false;
      }, () => {
        AlertService.add("danger", "Time Report failed", 2000);
        $scope.reportDisabled = false;
      });
  }
  // ----------------------------------------------------
  
  
}]);


//Set fields and sanity checks
function mapWorkorders(wo) {
  if(wo.unitNumber) wo.unitSort = Number(wo.unitNumber.replace(/\D+/g, ''));
  else wo.unitSort = 0;
  
  if(wo.technician) wo.techName = wo.technician.firstName + ' ' + wo.technician.lastName;
  else wo.techName = wo.techId;
  
  if(wo.header) {
    if (!wo.header.customerName) wo.header.customerName = '';
    wo.customerName = wo.header.customerName;
    wo.locationName = wo.header.leaseName;
  }
  else {
    wo.customerName = '';
    wo.locationName = '';
  }
  
  if (wo.timeStarted) {
    wo.epoch = new Date(wo.timeStarted).getTime();
  } else {
    wo.epoch = 0;
  }
  wo.totalMinutes = (wo.totalWoTime.hours * 60) + wo.totalWoTime.minutes;
  //let displayName = "";
  if (!wo.unit || !wo.unit.location || !wo.unit.location.name) {
    // do nothing
  } else if (wo.unit.location.name.length <= 20) {
    wo.displayLocationName = wo.unit.location.name;
  } else {
    wo.displayLocationName = wo.unit.location.name.slice(0,17) + "...";
  }
  return wo;
}
