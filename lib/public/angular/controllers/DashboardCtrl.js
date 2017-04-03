angular.module('CommonControllers', ['infinite-scroll']).controller('DashboardCtrl',
  ['$scope', '$route', '$location', '$window', '$cookies', 'AlertService', 'LoaderService', '$http', 'Users', 'TimeDisplayService',
function ($scope, $route, $location, $window, $cookies, AlertService, LoaderService, $http, Users, TimeDisplayService) {

  $scope.loaded = false;
  $scope.reportText = "Time Report";
  $scope.reportDisabled = false;
  $scope.WOSearchCount = 0;

  $scope.lookup = function (obj) {
    const queryParams = $location.search();

    if(queryParams.unit) {
      obj.unit = queryParams.unit;
    }

    $scope.loaded = false;
    $scope.spinnerOn();
    // Function in MyAccount ctrl. load WO with Query obj.
    $scope.WorkOrderLookup(obj).then(
      function (workorders) {
        $scope.workorders = workorders.map(mapWorkorders);
        $scope.loaded = true;
        $scope.spinnerOff();
      },
      function (reason){
        console.log("Failure: ", reason);
      }
    );

    $scope.WorkOrderCount(obj).then(
      function (count) {
        $scope.WOSearchCount = count.data;
      },
      function (err) {
        console.log("Counting Error: ", err);
      }
    )
  };

  $scope.orderByField = 'epoch';
  $scope.reverseSort = true;
  $scope.unitNumber = null;
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

  if($cookies.get('role') === "admin"){
    $scope.approved = true;
  }
  if($cookies.get('role') === "manager"){
    $scope.unapproved = true;
  }

  $scope.loadOnScroll = function () {
    console.log("Scrolling..");
    $scope.skip += $scope.limit;

    var query = {
      limit: $scope.limit,
      skip: $scope.skip
    };

    if($scope.dates.from && $scope.dates.to) {
      query.from = encodeURIComponent($scope.dates.from.toISOString());
      query.to = encodeURIComponent($scope.dates.to.toISOString());
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

    $scope.WorkOrderLookup(query).then(
      function (workorders) {
        var wo =  workorders.map(mapWorkorders);
        $scope.workorders = $scope.workorders.concat(wo);
      },
      function (reason){
        console.log("Failure: ", reason);
      }
    )
  };

  $scope.dates = {
    from: null,
    to: null
  };

  //ensure from date is always beginning of day
  $scope.startOfDay = function () {
    $scope.dates.from = new Date($scope.dates.from.setUTCHours(0,0,0,0));
  };

  //ensure to date is always end of day
  $scope.endOfDay = function () {
    $scope.dates.to = new Date($scope.dates.to.setUTCHours(23,59,59,999));
  };

  $scope.submit = function () {
    $scope.limit = 50;
    $scope.skip = 0;

    var query = {
      limit: $scope.limit,
      skip: $scope.skip
    };

    /* Used?
    if($scope.techsSupervised) {
      query.supervised = $scope.techsSupervised;
    }*/

    if($scope.dates.from && $scope.dates.to) {
      query.from = encodeURIComponent($scope.dates.from.toISOString());
      query.to = encodeURIComponent($scope.dates.to.toISOString());
    }

    if($scope.unitNumber) {
      query.unit = $scope.unitNumber;
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

  $scope.report = function () {
    $scope.reportText = "Loading...";
    $scope.reportDisabled = true;

    var query = {
      limit: $scope.limit.toString(),
      skip: $scope.skip.toString()
    };

    if($scope.dates.from && $scope.dates.to) {
      query.from = encodeURIComponent($scope.dates.from.toISOString());
      query.to = encodeURIComponent($scope.dates.to.toISOString());
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
      .then(function (resp) {
        var anchor = angular.element('<a/>');
        anchor.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(resp.data),
          target: '_blank',
          download: 'timeReport.csv'
        })[0].click();
        $scope.reportText = "Time Report";
        $scope.reportDisabled = false;
      }, function () {
        AlertService.add("danger", "Time Report failed", 2000);
        $scope.reportText = "Time Report";
        $scope.reportDisabled = false;
      });
  };

  $scope.createWorkOrder = function () {
    $location.path('/workorder/create');
  };

  $scope.resort = function (by) {
    $scope.orderByField = by;
    $scope.reverseSort = !$scope.reverseSort;
  };

  $scope.clickWorkOrder = function () {
    $window.open('#/workorder/review/' + this.workorder._id);
  };

  // Set billable background color for workorders
  $scope.setBillableBackgroundColor = function (wo) {
    if(wo.parts.length > 0){
      var partBillable = wo.isPartBillable.color;
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

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

function clearSearch() {

  var elements = [] ;
  elements = document.getElementsByClassName("search");

  for(var i=0; i<elements.length ; i++){
    elements[i].value = "" ;
  }
}
