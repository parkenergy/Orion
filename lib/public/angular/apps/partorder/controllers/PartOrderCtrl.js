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
  $scope.partorders = [];
  $scope.loaded = false;
  $scope.spinner = true;
  // --------------------------------------------------

  // Turn Spinner Off ---------------------------------
  $scope.spinnerOff = function () {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Passed to Component ------------------------------
  $scope.isContentLoaded = function (bool) {
    $scope.loaded = bool;
  };

  $scope.lookup = function (query) {
    $scope.loaded = false;
    $scope.PartOrderLookup(query).then(
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

  $scope.PartOrderLookup = function (query) {
    var deferred = $q.defer();
    console.log("Looking up Part Orders...");
    PartOrders.query(query,
      function (res) {
        console.log("Part Orders Loaded.");
        return deferred.resolve(res);
      },
      function (err) { return deferred.reject(err); }
    );
    return deferred.promise;
  };

  $scope.mapPartOrders = function (po) {

  };
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createPartOrder = function () {
    $location.url('/partorder/create');
  };
  // --------------------------------------------------
}]);
