angular.module('WorkOrderApp.Controllers').controller('WorkOrderPartsCtrl',
['$scope', function ($scope) {

  // Creates a new part for out parts.html page and directive.
  $scope.emptyWorkOrderPart = function () {
    return {
      WorkOrderId: null,
      PartId: null,
      isFreehandPart: false,
      vendorPartNumber: null,
      description: "",
      quantity: 0,
      cost: 0
    };
  };

  // Initialize the newPart variable with the appropriate data.
  $scope.newWorkOrderPart = $scope.emptyWorkOrderPart();

  // Removes a part from the table on the parts.html page.
  $scope.removePart = function (index) {
    $scope.workorder.workOrderParts.splice(index,1);
  };

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewPart = function () {
    var part = $scope.newWorkOrderPart;
    part.PartId = part.part.id;
    part.description = part.description || part.part.description;
    part.cost = part.cost || part.part.cost;
    $scope.workorder.workOrderParts.push(part);
    $scope.newWorkOrderPart = $scope.emptyWorkOrderPart();
  };

  $scope.$watch('newWorkOrderPart.part', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      if ($scope.newWorkOrderPart.part &&
          ($scope.newWorkOrderPart.part.vendorPartNumber === "Other" ||
           $scope.newWorkOrderPart.isFreehandPart) ) {
        $scope.newWorkOrderPart.isFreehandPart = true;
      } else {
        $scope.newWorkOrderPart.isFreehandPart = false;
      }
    }
  }, true);

}]);
