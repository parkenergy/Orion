angular.module('PaidTimeOffApp.Controllers')
.controller('PaidTimeOffCtrl', ['$scope', '$http', '$timeout', '$location', '$q', '$cookies', 'AlertService', 'ApiRequestService', 'DateService',
  function ($scope, $http, $timeout, $location, $q, $cookies, AlertService, ApiRequestService, DateService) {
    // Variables-----------------------------------------
    const ARS = ApiRequestService;
    const DS = DateService;
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
      console.log("Looking up PTOs...");
      console.log(query)
      ARS.PaidTimeOffs(query)
        .then((paidtimeoffs) => {
          console.log("PTOs Loaded.");
          $scope.paidtimeoffs = paidtimeoffs.map(mapPaidTimeOffs);
          $scope.loaded = true;
          $scope.spinnerOff();
        })
        .catch((err) => console.log("Failed to load: ", err));
    };
/*
    $scope.report = (query) => {
      $http({method: 'GET',url: '/api/paidtimeoffs', params: query})
        .then((res) =>{
            const anchor = angular.element('<a/>');
            anchor.attr({
              href: 'data:attachment/csv;charset=utf-8,' + encodeURI(res.data),
              target: '_blank',
              download: 'PartsReport.csv'
            })[0].click();
          },
          (err) => {
            AlertService.add("danger", "Report failed to load", 2000);
            console.log(err);
          }
        );
    };*/

    $scope.PaidTimeOffScrollLookup = (query) => {
      console.log("Looking up Ptos...");
      ARS.PaidTimeOffs(query)
        .then((paidtimeoffs) => {
          console.log("Part Orders Loaded.");
          const pto = paidtimeoffs.map(mapPaidTimeOffs);
          $scope.paidtimeoffs = $scope.paidtimeoffs.concat(pto);
        })
        .catch((err) => console.log("Failed to load part orders: ", err));
    };
    // --------------------------------------------------

    // Create sorting parameters ------------------------
    function mapPaidTimeOffs (pto) {
      // set to local times
      pto.DateFrom = DS.displayLocal(new Date(pto.DateFrom));
      pto.DateTo = DS.displayLocal(new Date(pto.DateTo));
      pto.epochDateFrom = new Date(pto.DateFrom).getTime();
      pto.epochDateTo = new Date(pto.DateTo).getTime();
      // set status
      if (pto.approved) {
        pto.status = 'approved';
      }
      if (pto.rejected) {
        pto.status = 'rejected';
      }
      if (!pto.rejected && !pto.approved) {
        pto.status = 'not reviewed';
      }

      return pto;
    }
    // --------------------------------------------------

    // Routing ------------------------------------------
  /*  $scope.createPaidTimeOff = () => {
      $location.url('/paidtimeoff/create');
    };*/
    // --------------------------------------------------
  },
]);
