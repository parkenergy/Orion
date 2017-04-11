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
  $scope.spinnerOff = () => {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Passed to Component ------------------------------
  // Function called any time Page loads or user scrolls past 50 units
  $scope.lookup = (query) => {
    $scope.loaded = false;
    $scope.CallReportLookup(query)
      .then((callreports) => {
          $scope.callreports = callreports.map(mapCallReports);
          $scope.loaded = true;
          $scope.spinnerOff();
        }, (err) => {
          console.log("Failed to load: ", err);
        }
      )
  };

  $scope.CallReportScrollLookup = (query) => {
    $scope.CallReportLookup(query).then(
      (callreports) => {
        const cr = callreports.map(mapCallReports);
        $scope.callreports = $scope.callreports.concat(cr);
      },
      (err) => {
        console.log("Failed to load call reports on scroll: ", err);
      }
    )
  };
  // --------------------------------------------------

  // Actual lookup http promise query -----------------
  $scope.CallReportLookup = (query) => {
    const deferred = $q.defer();
    console.log("Looking up Call Reports...");
    CallReports.query(query,
      (res) => {
        console.log("Call Reports Loaded.");
        return deferred.resolve(res);
      },
      (err) => deferred.reject(err));
    return deferred.promise;
  };
  // --------------------------------------------------

  // Create Sorting parameters ------------------------
  function mapCallReports (cr) {
    cr.epoch = new Date(cr.callTime).getTime();

    return cr;
  }
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createCallReport = function () {
    $location.url('/callreport/create');
  };
  // --------------------------------------------------
}]);
