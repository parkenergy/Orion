/**
 *            CallReportCtrl
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CallReportApp.Controllers')
.controller('CallReportCtrl',
  ['$scope', '$http', '$timeout', '$location', '$q', '$cookies', 'AlertService', 'CallReports',
function ($scope, $http, $timeout, $location, $q, $cookies, AlertService, CallReports) {
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
    $scope.CallReportLookup(query)
      .then(
        function (callreports) {
          $scope.callreports = callreports.map(mapCallReports);
          $scope.loaded = true;
          $scope.spinnerOff();
        },
        function (err) {
          console.log("Failed to load: ", err);
        }
      )
  };

  $scope.CallReportScrollLookup = function (query) {
    $scope.CallReportLookup(query).then(
      function (callreports) {
        var cr = callreports.map(mapCallReports);
        $scope.callreports = $scope.callreports.concat(cr);
      },
      function (err) {
        console.log("Failed to load call reports on scroll: ", err);
      }
    )
  };
  // --------------------------------------------------

  // Actual lookup http promise query -----------------
  $scope.CallReportLookup = function (query) {
    var deferred = $q.defer();
    console.log("Looking up Call Reports...");
    CallReports.query(query,
      function (res) {
        console.log("Call Reports Loaded.");
        return deferred.resolve(res);
      },
      function (err) {
        return deferred.reject(err);
      });
    return deferred.promise;
  };
  // --------------------------------------------------

  // Create Sorting parameters ------------------------
  function mapCallReports (cr) {
    cr.epoch = new Date(cr.timeSubmitted).getTime();

    return cr;
  }
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createCallReport = function () {
    $location.url('/callreport/create');
  };
  // --------------------------------------------------
}]);
