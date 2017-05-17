angular.module('CommonControllers', ['infinite-scroll']).controller('DashboardCtrl',
  ['$scope', '$location', '$window', '$cookies', 'AlertService', 'ApiRequestService', 'SessionService', '$http', 'TimeDisplayService',
function ($scope, $location, $window, $cookies, AlertService, ApiRequestService, SessionService, $http, TimeDisplayService) {

  const SS = SessionService;
  const ARS = ApiRequestService;
  $scope.loaded = false;
  $scope.reportText = "Time Report";
  $scope.reportDisabled = false;
  $scope.WOSearchCount = 0;
  
  $scope.lookup = (obj) => {
    const queryParams = $location.search();

    if(queryParams.unit) {
      obj.unit = queryParams.unit;
    }

    $scope.loaded = false;
    $scope.spinnerOn();
    if(SS.get("unitNumber")) {
      ARS.http.get.UnitWorkOrders(obj)
        .then((res) => {
          $scope.workorders = res.data.map(mapWorkorders);
          $scope.loaded = true;
          $scope.spinnerOff();
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
      ARS.http.get.WorkOrdersNoIdentityCount(obj)
        .then((res) => {
          $scope.WOSearchCount = res.data;
        }, (err) => {
          console.log(`Counting Error: ${err}`);
        });
    } else {
      // load workorders based on query
      ARS.WorkOrders(obj)
        .then((res) => {
          $scope.workorders = res.map(mapWorkorders);
          $scope.loaded = true;
          $scope.spinnerOff();
        }, (err) => {
          console.log(`Failure: ${err}`);
        });
      // get count of the same query
      ARS.http.get.WorkOrderCount(obj)
        .then((res) => {
          $scope.WOSearchCount = res.data;
        }, (err) => {
          console.log(`Counting Error: ${err}`);
        });
    }
  };

  $scope.orderByField = 'epoch';
  $scope.reverseSort = true;
  $scope.unitNumber = SS.get("unitNumber") ? SS.get("unitNumber") : null;
  $scope.techName = null;
  $scope.leaseName = null;
  $scope.customerName = null;
  $scope.billable = null;
  $scope.billed = null;
  $scope.billParts = null;
  $scope.unapproved = false;
  $scope.approved = false;
  $scope.synced = false;
  $scope.limit = 50;
  $scope.skip = 0;

  $scope.pad = TimeDisplayService.pad;
  
  if(!SS.get("unitNumber")){
    if($cookies.get('role') === "admin"){
      $scope.approved = true;
      $scope.reverseSort = true;
    }
    if($cookies.get('role') === "manager"){
      $scope.unapproved = true;
      $scope.reverseSort = false;
    }
  }

  $scope.loadOnScroll = () => {
    console.log("Scrolling..");
    $scope.skip += $scope.limit;

    const query = {
      limit: $scope.limit,
      skip: $scope.skip
    };

    if($scope.dates.from && $scope.dates.to) {
      query.from = $scope.dates.from;
      query.to = $scope.dates.to;
    }
    if($scope.unitNumber) {
      query.unit = $scope.unitNumber;
    }
    if($scope.techName) {
      query.tech = $scope.techName;
    }
    if($scope.leaseName) {
      query.loc = $scope.leaseName;
    }
    if($scope.customerName) {
      query.cust = $scope.customerName;
    }
    if($scope.billed){
      query.billed = $scope.billed;
    }
    if($scope.billable) {
      query.billable = $scope.billable;
    }
    if($scope.billParts) {
      query.billParts = $scope.billParts;
    }
    if($scope.unapproved){
      query.unapproved = $scope.unapproved;
    }
    if($scope.approved){
      query.approved = $scope.approved;
    }
    if($scope.synced){
      query.synced = $scope.synced;
    }
  
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

  $scope.dates = {
    from: null,
    to: null
  };

  //ensure from date is always beginning of day
  $scope.startOfDay = () => {
    $scope.dates.from = new Date($scope.dates.from.setHours(0,0,0,0));
  };

  //ensure to date is always end of day
  $scope.endOfDay = () => {
    $scope.dates.to = new Date($scope.dates.to.setHours(23,59,59,999));
  };

  $scope.submit = () => {
    $scope.limit = 50;
    $scope.skip = 0;

    const query = {
      limit: $scope.limit,
      skip: $scope.skip
    };

    /* Used?
    if($scope.techsSupervised) {
      query.supervised = $scope.techsSupervised;
    }*/

    if($scope.dates.from && $scope.dates.to) {
      query.from = $scope.dates.from;
      query.to = $scope.dates.to;
    }

    if($scope.unitNumber && ($scope.unitNumber === SS.get("unitNumber"))) {
      query.unit = $scope.unitNumber;
    } else if($scope.unitNumber !== SS.get("unitNumber")){
      query.unit = $scope.unitNumber;
      SS.drop("unitNumber");
    } else {
      SS.drop("unitNumber");
    }
    if($scope.techName) {
      $scope.techName = $scope.techName.toUpperCase();
      query.tech = $scope.techName;
    }
    if($scope.leaseName) {
      query.loc = $scope.leaseName;
    }
    if($scope.customerName) {
      query.cust = $scope.customerName;
    }
    if($scope.billed){
      query.billed = $scope.billed;
    }
    if($scope.billable) {
      query.billable = $scope.billable
    }
    if($scope.billParts) {
      query.billParts = $scope.billParts
    }
    if($scope.unapproved){
      query.unapproved = $scope.unapproved;
    }
    if($scope.approved){
      query.approved = $scope.approved;
    }
    if($scope.synced){
      query.synced = $scope.synced;
    }
    
    $scope.lookup(query);
  };

  $scope.report = () => {
    $scope.reportText = "Loading...";
    $scope.reportDisabled = true;

    const query = {
      limit: $scope.limit.toString(),
      skip: $scope.skip.toString()
    };

    if($scope.dates.from && $scope.dates.to) {
      query.from = $scope.dates.from;
      query.to = $scope.dates.to;
    }

    if($scope.unitNumber) {
      query.unit = $scope.unitNumber.toString();
    }
    if($scope.techName) {
      query.tech = $scope.techName.toUpperCase();
    }
    if($scope.leaseName) {
      query.loc = $scope.leaseName.toString();
    }
    if($scope.customerName) {
      query.cust = $scope.customerName.toString();
    }

    query.report = 'true';

    $http({method: 'GET',url: '/api/workorders', params: query})
      .then((resp) => {
        const anchor = angular.element('<a/>');
        anchor.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(resp.data),
          target: '_blank',
          download: 'timeReport.csv'
        })[0].click();
        $scope.reportText = "Time Report";
        $scope.reportDisabled = false;
      }, () => {
        AlertService.add("danger", "Time Report failed", 2000);
        $scope.reportText = "Time Report";
        $scope.reportDisabled = false;
      });
  };

  $scope.createWorkOrder = () => {
    $location.path('/workorder/create');
  };

  $scope.resort = (by) => {
    $scope.orderByField = by;
    $scope.reverseSort = !$scope.reverseSort;
  };

  $scope.clickWorkOrder = (wo) => {
    $window.open('#/workorder/review/' + wo._id);
  };

  // Set billable background color for workorders
  $scope.setBillableBackgroundColor = (wo) => {
    if(wo.parts.length > 0){
      const partBillable = wo.isPartBillable.color;
      if(wo.billingInfo.billableToCustomer || (partBillable === '#a4cf80')) return '#a4cf80';
    } else {
      if(wo.billingInfo.billableToCustomer) return '#a4cf80';
    }

  };

  $scope.submit();

}]);

//Set fields and sanity checks
function mapWorkorders(wo){
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

  wo.epoch = new Date(wo.timeStarted).getTime();
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

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

function clearSearch() {

  //let elements = [] ;
  const elements = document.getElementsByClassName("search");

  for(let i=0; i<elements.length ; i++){
    elements[i].value = "" ;
  }
}
