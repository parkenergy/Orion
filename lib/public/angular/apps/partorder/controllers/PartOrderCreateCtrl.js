/**
 *            PartOrderCreateCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
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
  $scope.isValid = function () {
    if (($scope.partorder.part.quantity > 0) && $scope.partorder.originNSID && $scope.partorder.destinationNSID) {
      $scope.valid = true;
    } else {
      $scope.valid = false;
    }
  };
  $scope.$watch('partorder.part.quantity', function (newVal, oldVal) {
    if ( newVal != oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.originNSID', function (newVal, oldVal) {
    if ( newVal != oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.destinationNSID', function (newVal, oldVal) {
    if(newVal != oldVal){
      $scope.isValid();
      $scope.partorder.truckId = LocationItemService.getTruckFromNSID($scope.partorder.destinationNSID,$scope.locations);
    }
  });
  // -----------------------------------------------

  // Make shift part order -------------------------
  function newPartOrder () {
    return {
      truckId: '',
      techId: '',
      originNSID: '',
      destinationNSID: '',
      part: {}
    }
  }
  // Passed Functions to Add Part Component -------
  $scope.addManualPart = function (part) {
    $scope.partorder.part = part;
  };

  $scope.deletePart = function () {
    $scope.partorder.part = {};
  };

  $scope.originChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.destinationChange = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // -----------------------------------------------

  // Construction for Search Table -----------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
  // -----------------------------------------------

  // Save Part Order -------------------------------
  $scope.save = function () {
    $scope.partorder.partNSID = $scope.partorder.part.netsuiteId;
    $scope.partorder.quantity = $scope.partorder.part.quantity;
    $scope.partorder.timeCreated = new Date();
    $scope.partorder.techId = $scope.techId;
    PartOrders.save($scope.partorder,
      function (res) {
        AlertService.add('success', "Successfully created Part Order!");
        $location.url('/partorder');
        console.log(res);
      },
      function (err) {
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      })
  };
  // -----------------------------------------------
}]);
