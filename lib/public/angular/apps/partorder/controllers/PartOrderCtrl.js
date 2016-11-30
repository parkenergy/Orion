/**
 *            PartOrderCtrl
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderCtrl',
  ['$scope', '$timeout', '$location','$q', '$cookies', 'AlertService', 'PartOrders',
function ($scope, $timeout, $location, $q, $cookies, AlertService,PartOrders) {
  // Variables-----------------------------------------
  $scope.loaded = false;
  $scope.spinner = true;
  // --------------------------------------------------

  // Turn Spinner Off ---------------------------------
  $scope.spinnerOff = function () {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Passed to Component ------------------------------
  // Function called any time Page loads or user scrolls past 50 units
  $scope.lookup = function (query) {
    $scope.loaded = false;
    $scope.PartOrderLookup(query)
    .then(
      function (partorders) {
        $scope.partorders = partorders.map(mapPartOrders);
        $scope.loaded = true;
        $scope.spinnerOff();
      },
      function (err) {
        console.log("Failed to load: ", err);
      }
    )
  };

  $scope.PartOrderScrollLookup = function (query) {
    $scope.PartOrderLookup(query).then(
      function (partorders) {
        var po = partorders.map(mapPartOrders);
        $scope.partorders = $scope.partorders.concat(po);
      },
      function (err) {
        console.log("Failed to load part orders: ", err);
      }
    )
  };
  // --------------------------------------------------

  // Actual lookup http promise query.
  $scope.PartOrderLookup = function (query) {
    var deferred = $q.defer();
    console.log("Looking up Part Orders...");
    PartOrders.query(query,
      function (res) {
        console.log(res);
        console.log("Part Orders Loaded.");
        return deferred.resolve(res);
      },
      function (err) { return deferred.reject(err); }
    );
    return deferred.promise;
  };

  // Routing ------------------------------------------
  $scope.createPartOrder = function () {
    $location.url('/partorder/create');
  };
  // --------------------------------------------------
}]);

function mapPartOrders (po) {
  po.epoch = new Date(po.timeCreated).getTime();
  return po;
}

// Infinite Scroll Settings --------------------------
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);
// ---------------------------------------------------
