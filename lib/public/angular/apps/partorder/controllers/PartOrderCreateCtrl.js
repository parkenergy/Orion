/**
 *            PartOrderCreateCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', 'AlertService', 'GeneralPartSearchService', 'LocationItemService', 'locations', 'parts',
function ($scope, $timeout, $uibModal, $cookies, AlertService, GeneralPartSearchService, LocationItemService, locations, parts) {
  // Variables ----------------------------------------------
  $scope.partorder = newPartOrder();
  $scope.parts = parts;
  $scope.locations = locations;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  //----------------------------------------------------------

  // remove later **
  $scope.partorder.techId = $scope.techId;
  // ------------ **

  // Set Validity of Part Order ------------------------------
  $scope.isValid = function () {
    if (($scope.partorder.part.quantity > 0) && $scope.partorder.originLocationNSID && $scope.partorder.destinationNSID) {
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
  // ---------------------------------------------------------

  // Make shift part order -----------------------------------
  function newPartOrder () {
    return {
      truckId: '',
      techId: '',
      destinationNSID: '',
      part: {}
    }
  }
  // Passed Functions to Add Part Component ------------------
  $scope.addManualPart = function (part) {
    $scope.partorder.part = part;
  };

  $scope.deletePart = function () {
    $scope.partorder.part = {};
  };

  $scope.originChange = function (changedData) {
    $scope.partorder.originLocationNSID = changedData;
  };

  $scope.destinationChange = function (changedData) {
    $scope.partorder.destinationNSID = changedData;
  };
  // ---------------------------------------------------------
  // Construction for Search Table ---------------------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
  // ---------------------------------------------------------
}]);
