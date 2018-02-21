angular.module('PartOrderApp.Controllers')
.controller('PartOrderCtrl',
  ['$scope', '$http', '$timeout', '$location','$q', '$cookies', 'AlertService', 'LocationItemService', 'ApiRequestService', 'locations', 'DateService',
function ($scope, $http, $timeout, $location, $q, $cookies, AlertService, LocationItemService, ApiRequestService, locations, DateService) {
  // Variables-----------------------------------------
  const ARS = ApiRequestService;
  const DS = DateService;
  $scope.loaded = false;
  $scope.spinner = true;
  $scope.locations = locations;
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
    console.log("Looking up Part Orders...");
    ARS.PartOrders(query)
      .then((partorders) => {
        console.log("Part Orders Loaded.");
        $scope.partorders = partorders.map(mapPartOrders);
        $scope.loaded = true;
        $scope.spinnerOff();
      })
      .catch((err) => console.log("Failed to load: ", err));
  };

  $scope.report = (query) => {
    $http({method: 'GET',url: '/api/partorders', params: query})
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
  };

  $scope.PartOrderScrollLookup = (query) => {
    console.log("Looking up Part Orders...");
    ARS.PartOrders(query)
      .then((partorders) => {
        console.log("Part Orders Loaded.");
        const po = partorders.map(mapPartOrders);
        $scope.partorders = $scope.partorders.concat(po);
      })
      .catch((err) => console.log("Failed to load part orders: ", err));
  };
  // --------------------------------------------------

  // Create sorting parameters ------------------------
  function mapPartOrders (po) {
    po.timeCreated = DS.displayLocal(new Date(po.timeCreated));
    po.epoch = new Date(po.timeCreated).getTime();
    po.destination = LocationItemService.getNameFromNSID(po.destinationNSID,$scope.locations);

    return po;
  }
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createPartOrder = () => {
    $location.url('/partorder/create');
  };
  // --------------------------------------------------
}]);
