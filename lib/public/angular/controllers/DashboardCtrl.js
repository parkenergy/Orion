angular.module('CommonControllers', ['infinite-scroll']).controller('DashboardCtrl',
  ['$scope', '$route', '$location', '$window', 'AlertService', 'LoaderService',
    function ($scope, $route, $location, $window, AlertService, LoaderService) {

      $scope.loaded = false;

      $scope.lookup = function(obj) {
        $scope.loaded = false;
        $scope.WorkOrderLookup(obj).then(
          function(workorders) {
            $scope.workorders = workorders.map(mapWorkorders);
            $scope.loaded = true;
            $scope.spinnerOff();
          },
          function(reason){
            console.log("Failure: ", reason);
          }
        )
      };

      $scope.orderByField = 'epoch';
      $scope.reverseSort = true;
      $scope.unitNumber = null;
      $scope.techName = null;
      $scope.leaseName = null;
      $scope.customerName = null;
      $scope.limit = 50;
      $scope.skip = 0;

      $scope.loadOnScroll = function() {
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

        $scope.WorkOrderLookup(query).then(
          function(workorders) {
            var wo = workorders.map(mapWorkorders);
            $scope.workorders = $scope.workorders.concat(wo);
          },
          function(reason){
            console.log("Failure: ", reason);
          }
        )
      };

      $scope.dates = {
        from: null,
        to: null
      };

      //ensure from date is always beginning of day
      $scope.startOfDay = function() {
        $scope.dates.from = new Date(
          $scope.dates.from.setHours(0,0,0,0)
        );
      };

      //ensure to date is always end of day
      $scope.endOfDay = function() {
        $scope.dates.to = new Date(
          $scope.dates.to.setHours(23,59,59,999)
        );
      };

      $scope.submit = function() {
        $scope.limit = 50;
        $scope.skip = 0;

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

        $scope.lookup(query);
      };

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
        $window.open('#/workorder/review/' + this.workorder._id, '_blank');
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

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
