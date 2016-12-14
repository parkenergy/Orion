/**
 *            PartOrderEditCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderEditCtrl',
  ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'LocationItemService', 'PartOrders', 'InventoryTransfers', 'partorder', 'locations',
function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, LocationItemService, PartOrders, InventoryTransfers, partorder, locations) {
  // Variables ----------------------------------------
  $scope.locations = locations;
  $scope.partorder = partorder;
  // --------------------------------------------------

  // Passed Functions to Edit  ------------------------
  $scope.headerSelectFieldChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.headerTextFieldChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.changeThisTextAreaField = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // --------------------------------------------------

  // Passed function to Edit Table --------------------
  $scope.changeStatus = function (changedData, selected) {
    $scope.partorder.status = selected;
  };
  // --------------------------------------------------

  // Submit Changes to Part Order ---------------------
  $scope.submit = function (status) {
    var ableToSubmit = true;
    if ( (status == 'canceled') && !$scope.partorder.comment ) {
      AlertService.add('danger', 'Please fill out the comment box if canceling a part order.');
      ableToSubmit = false;
    }
    if ( (status == 'shipped') && !$scope.partorder.trackingNumber ) {
      AlertService.add('danger', 'Please fill out the tracking number.');
      ableToSubmit = false;
    }

    if ( ableToSubmit ) {
      if ( status == 'shipped' || status == 'backorder' || status == 'canceled' ) {
        $scope.partorder.approvedBy = $cookies.get('tech');
      }

      if ( status == 'completed' ) {
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      if( status == 'canceled' && $scope.partorder.source === 'Orion'){
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      PartOrders.update({ id: $scope.partorder.orderId}, $scope.partorder,
        function (res) {
          AlertService.add('success', "Update was successful.");
          console.log(res);
          // If successful create Inventory Transfer
          if ( res.status === 'completed' ) {
            var thisIT = $scope.newInventoryTransfer();
            thisIT.originLocationNSID = res.originNSID;
            thisIT.destinationLocationNSID = res.destinationNSID;

            thisIT.originLocation = LocationItemService.getIDFromNSID(res.originNSID, $scope.locations);
            thisIT.destinationLocation = LocationItemService.getIDFromNSID(res.destinationNSID, $scope.locations);

            thisIT.truckId = LocationItemService.getTruckFromNSID(res.destinationNSID, $scope.locations);

            thisIT.parts.push(res.part);
            thisIT.parts[0].netsuiteId = res.partNSID;
            thisIT.parts[0].quantity = res.quantity;

            InventoryTransfers.save({}, thisIT,
              function (res) {
                console.log("Inventory Transfer Created.");
                $scope.completeForm();
              },
              function (err) {
                AlertService.add('danger', 'An error occurred while attempting to save inventory transfer.');
                console.log(err);
              }
            );
          } else {
            $scope.completeForm();
          }
        },
        function (err) {
          console.log(err);
          AlertService.add('danger', 'An error occurred while attempting to update this part order.');
        }
      );
    }
  };
  // --------------------------------------------------

  // Create IT model for new IT -----------------------
  $scope.newInventoryTransfer = function () {
    return {
      inventorytransferDate: new Date(),

      truckId: '',

      originLocation: null,
      originLocationNSID: '',
      destinationLocation: null,
      destinationLocationNSID: '',

      parts: [],

      techId: $scope.partorder.techId
    }
  };
  // --------------------------------------------------


  // Route back ---------------------------------------
  $scope.completeForm = function () {
    $location.url('/partorder')
  };
  // --------------------------------------------------
}]);
