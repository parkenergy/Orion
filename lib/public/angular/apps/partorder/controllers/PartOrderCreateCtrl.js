/**
 *            PartOrderCreateCtrl
 *
 * Created by marcusjwhelan on 11/9/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', 'AlertService', 'GeneralPartSearchService', 'locations', 'parts',
function ($scope, $timeout, $uibModal, $cookies, AlertService, GeneralPartSearchService, locations, parts) {
  // Variables ----------------------------------------------
  $scope.partorder = newPartOrder();
  $scope.parts = parts;
  $scope.locations = locations;
  $scope.truckId = $cookies.get('truckId');
  $scope.valid = false;
  //----------------------------------------------------------

  // Check if Part has Quantity ------------------------------
  $scope.$watch('partorder.part.quantity', function (newVal, oldVal) {
    if (newVal != oldVal) $scope.valid = newVal > 0;
  });
  // ---------------------------------------------------------

  // Make shift part order -----------------------------------
  function newPartOrder () {
    return {
      truckId: '',
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

  $scope.updateDestination = function (item,type) {
    if(type === "netsuiteId"){
      $scope.partorder.destinationNSID = item;
    }
  };
  // ---------------------------------------------------------
  // Construction for Search Table ---------------------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
  // ---------------------------------------------------------
}]);
