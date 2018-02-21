angular.module('PartOrderApp.Controllers')
.controller('PartOrderEditCtrl',
  ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'LocationItemService', 'PartOrders', 'InventoryTransfers', 'partorder', 'locations', 'DateService',
function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, LocationItemService, PartOrders, InventoryTransfers, partorder, locations, DateService) {
  // Variables ----------------------------------------
  const DS = DateService;
  $scope.locations = locations;
  $scope.partorder = partorder;
  // --------------------------------------------------

  const setSave = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.saveToOrion(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.saveToOrion(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeShipped) {
      $scope.partorder.timeShipped = DS.saveToOrion(new Date($scope.partorder.timeShipped));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.saveToOrion(new Date($scope.partorder.timeComplete));
    }
  };
  const setDisplay = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.displayLocal(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.displayLocal(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeShipped) {
      $scope.partorder.timeShipped = DS.displayLocal(new Date($scope.partorder.timeShipped));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.displayLocal(new Date($scope.partorder.timeComplete));
    }
  };

  // Passed Functions to Edit  ------------------------
  $scope.headerSelectFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.headerTextFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.changeThisTextField = (changedData, selected) => {
    if(selected === 'carrier'){
      ObjectService.updateNonNestedObjectValue($scope.partorder, changedData.toUpperCase(), selected);
    }
  };

  $scope.changeThisTextAreaField = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // --------------------------------------------------

  // Passed function to Edit Table --------------------
  $scope.changeStatus = (changedData, selected) => {
    $scope.partorder.status = selected;
  };
  // --------------------------------------------------

  // Submit Changes to Part Order ---------------------
  $scope.submit = (status) => {
    let ableToSubmit = true;
    if ( (status === 'canceled') && !$scope.partorder.comment ) {
      AlertService.add('danger', 'Please fill out the comment box if canceling a part order.');
      ableToSubmit = false;
    }
    if ( (status === 'shipped') && (!$scope.partorder.trackingNumber || !$scope.partorder.carrier )) {
      AlertService.add('danger', 'Please fill out the tracking number and carrier name. If none leave N/A');
      ableToSubmit = false;
    }

    if ( ableToSubmit ) {
      if ( status === 'shipped' || status === 'backorder' || status === 'canceled' ) {
        $scope.partorder.approvedBy = $cookies.get('tech');
      }

      if ( status === 'completed' ) {
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      if( status === 'canceled' && $scope.partorder.source === 'Orion'){
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      setSave();
      PartOrders.update({ id: $scope.partorder.orderId}, $scope.partorder,
        (res) => {
          AlertService.add('success', "Update was successful.");
          console.log(res);
          // If successful create Inventory Transfer
          if ( res.status === 'completed' ) {
            const thisIT = $scope.newInventoryTransfer();
            thisIT.originLocationNSID = res.originNSID;
            thisIT.destinationLocationNSID = res.destinationNSID;

            thisIT.originLocation = LocationItemService.getIDFromNSID(res.originNSID, $scope.locations);
            thisIT.destinationLocation = LocationItemService.getIDFromNSID(res.destinationNSID, $scope.locations);

            thisIT.truckId = LocationItemService.getTruckFromNSID(res.destinationNSID, $scope.locations);

            thisIT.parts.push(res.part);
            thisIT.parts[0].netsuiteId = res.partNSID;
            thisIT.parts[0].quantity = res.quantity;

            InventoryTransfers.save({}, thisIT,
              (res) => {
                console.log("Inventory Transfer Created.");
                $scope.completeForm();
              },
              (err) => {
                setDisplay();
                AlertService.add('danger', 'An error occurred while attempting to save inventory transfer.');
                console.log(err);
              }
            );
          } else {
            $scope.completeForm();
          }
        },
        function (err) {
          setDisplay();
          console.log(err);
          AlertService.add('danger', 'An error occurred while attempting to update this part order.');
        }
      );
    }
  };
  // --------------------------------------------------

  // Create IT model for new IT -----------------------
  $scope.newInventoryTransfer = () => ({
      inventorytransferDate: DS.saveToOrion(new Date()),

      truckId: '',

      originLocation: null,
      originLocationNSID: '',
      destinationLocation: null,
      destinationLocationNSID: '',

      parts: [],

      techId: $scope.partorder.techId
    });
  // --------------------------------------------------


  // Route back ---------------------------------------
  $scope.completeForm = () => {
    $location.url('/partorder')
  };
  // --------------------------------------------------
}]);
