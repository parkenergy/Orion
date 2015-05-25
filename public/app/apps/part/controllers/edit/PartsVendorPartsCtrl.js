angular.module('PartApp.Controllers').controller('PartsVendorPartsCtrl',
['$scope', '$location', 'AlertService', 'VendorParts',
function ($scope, $location, AlertService, VendorParts) {

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewVendorPart = function () {
    var vp = $scope.newVendorPart;

    // we need to pull the name off of the vendor for UI reasons
    var vendorName = $scope.vendors.filter(function (v) {
      return v._id === vp.VendorId;
    })[0].name;

    // add fill it out the way it's loaded from the DB
    vp.vendor = {
      name: vendorName
    };

    // need to allow simultaneous part creation and vendor tagging.
    // first case: part hasn't been saved yet.
    if (!vp.PartId) {
      // need to allow simultaneous part creation and vendor tagging.
      if (!$scope.unsavedVendorParts) { $scope.part.unsavedVendorParts = []; }
      $scope.part.unsavedVendorParts.push(vp);
      $scope.part.vendorParts.push(vp);
      $scope.newVendorPart = $scope.emptyVendorPart();
    // second case: part already exists
    } else {
      // Create a new vendor part in the database.
      VendorParts.save({}, vp,
        function (response) {
          AlertService.add("success", "That vendor was successfully added.");
          $scope.submitting = false;
          $scope.part.vendorParts.push(response);
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
      $scope.newVendorPart = $scope.emptyVendorPart();
    }

  };

  // Removes a vendor part from the database
  $scope.removeVendorPart = function (index) {
    var removedPart = $scope.part.vendorParts.splice(index,1);
    var id = removedPart[0]._id;
    $scope.submitting = true;
    VendorParts.delete({id: id},
      function (response) {
        AlertService.add("success", "That vendor was successfully removed.");
        $scope.submitting = false;
      },
      function (err) {
        AlertService.add("error", err);
        $scope.submitting = false;
        $scope.part.vendorParts.push(removedPart);
      }
    );
  };

  // Routes user to vendor part edit page.
  $scope.editVendorPart = function (index) {
    var id = $scope.part.vendorParts[index]._id;
    console.log(id);
    $location.path("/vendorpart/edit/" + id);
  };

  $scope.emptyVendorPart = function () {
    return {
      PartId: $scope.part._id,
      VendorId: null,
      vendorPartNumber: null,
      vendorPartDescription: $scope.part.description,
      vendorPartCost: 0
    };
  };

  (function () {
    $scope.newVendorPart = $scope.emptyVendorPart();
  })();

}]);
