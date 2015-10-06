angular.module('InventoryTransferApp.Controllers').controller('InventoryTransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'InventoryTransfers', 'inventorytransfer', 'parts', 'locations', 'users',
  function($scope, $window, $location, $timeout, AlertService, InventoryTransfers, inventorytransfer, parts, locations, users){

    $scope.message = (inventorytransfer !== null ? "Edit " : "Create ") + "Inventory Transfer";
    $scope.inventorytransfer = inventorytransfer || newInventoryTransfer();

    $scope.parts = parts;
    $scope.locations = locations;

    $scope.save = function(){
      $scope.submitting = true;
      InventoryTransfers.save({_id: $scope.inventorytransfer._id}, $scope.inventorytransfer,
        function(response){
          AlertService.add('success', 'Save was successful.');
          $scope.submitting = false;
          $location.path('/myaccount');
        },
        function(err){
          AlertService.add('danger','An error occurred while attemping to save.');
          $scope.submitting = false;
        }
      );
    };

    $scope.destroy = function(){
      $scope.submitting = true;
      InventoryTransfers.destroy($scope.inventorytransfer,
        function(response){
          AlertService.add('success','Save was successful.');
          $scope.submitting = false;
          $location.path('/inventorytransfer');
        },
        function(err){
          AlertService.add('danger', 'An error occured whle attemping to save.');
          $scope.submitting = false;
        }
      );
    };

    $scope.partsTableModel = {
      tableName: "Search For Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "Description", objKey: "description" }
      ],
      rowClickAction: addPart,
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
      sort: { column: ["number"], descending: false }
    };

    function addPart(part) {
      $scope.inventorytransfer.parts.push({
        number:       part.number,
        description:  part.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false
      });
    }

    function newInventoryTransfer(){
      var newInventoryTransfer =
      {
        inventorytransferDate: new Date(),

        originLocation: {},
        destinationLocation: {},

        parts: []

      };
      return newInventoryTransfer;
    }
  }]);
