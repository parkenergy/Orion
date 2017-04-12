angular.module('PartOrderApp.Controllers')
.controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', '$location', 'AlertService', 'GeneralPartSearchService', 'LocationItemService', 'ObjectService', 'PartOrders', 'locations', 'parts',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, GeneralPartSearchService, LocationItemService, ObjectService, PartOrders, locations, parts) {

  // Variables -------------------------------------
  $scope.partorder = newPartOrder();
  $scope.parts = parts;
  $scope.locations = locations;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  // -----------------------------------------------

  // Set Validity of Part Order --------------------
  $scope.isValid = () => {
    if (($scope.partorder.part.quantity > 0) && $scope.partorder.originNSID && $scope.partorder.destinationNSID) {
      $scope.valid = true;
    } else {
      $scope.valid = false;
    }
  };
  $scope.$watch('partorder.part.quantity', (newVal, oldVal)  => {
    if ( newVal !== oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.originNSID', (newVal, oldVal) => {
    if ( newVal !== oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.destinationNSID', (newVal, oldVal) => {
    if(newVal !== oldVal){
      $scope.isValid();
      $scope.partorder.truckId = LocationItemService.getTruckFromNSID($scope.partorder.destinationNSID,$scope.locations);
    }
  });
  // -----------------------------------------------

  // Make shift part order -------------------------
  function newPartOrder () {
    return {
      partNSID: null,
      quantity: null,

      timeCreated: null,

      comment: '',
      trackingNumber: '',

      techId: '',
      originNSID: '',
      destinationNSID: '',
      part: {}
    }
  }
  // Passed Functions to Add Part Component -------
  $scope.addManualPart = (part) => {
    $scope.partorder.part = part;
  };

  $scope.deletePart = () => {
    $scope.partorder.part = {};
  };

  $scope.originChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.destinationChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // -----------------------------------------------

  // Construction for Search Table -----------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
  // -----------------------------------------------

  // Save Part Order -------------------------------
  $scope.save = () => {
    // Set Last Variables
    const now = new Date();
    $scope.partorder.partNSID = $scope.partorder.part.netsuiteId;
    $scope.partorder.quantity = $scope.partorder.part.quantity;
    $scope.partorder.timeCreated = now;
    $scope.partorder.timeSubmitted = now;
    $scope.partorder.techId = $scope.techId;

    // Finally save new Part Order
    PartOrders.save({},$scope.partorder,
      (res) => {
        AlertService.add('success', "Successfully created Part Order!");
        $location.url('/partorder');
      },
      (err) => {
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      }
    );
  };
  // -----------------------------------------------
}]);
