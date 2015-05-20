angular.module('TransferApp.Controllers').controller('TransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'transfer', 'units', 'customers', 'users', 'parts', 'role', 'servicePartners', 'TransferEditService', 'TransferAccordionService', 'GeographyService',
  function ($scope, $window, $location, $timeout, AlertService, transfer, units, customers, users, parts, role, servicePartners, TransferEditService, TransferAccordionService, GeographyService) {

    $scope.title = (transfer !== null ? "Edit " : "Create ") + "Transfer";
    $scope.loadingData = true;
    $scope.states = GeographyService.states;

    TransferEditService.load(transfer, function (err) {
      if (err) {
        AlertService.add("danger", err);
      } else {

        $scope.transfer = TransferEditService.transfer;
        $scope.locations = TransferEditService.locations;
        $scope.technicians = TransferEditService.technicians;

        // Setup the button text.
        $scope.submitButtonText =
          TransferEditService.submitButtonText($scope.transfer);
        $scope.rejectButtonText =
          TransferEditService.rejectButtonText($scope.transfer);

        // Set up the accordion.
        $scope.accordion = TransferAccordionService.instantiate($scope.transfer);
        $scope.oneAtATime = !$scope.transfer.id;
        $timeout(function () { $scope.loadingData = false; }, 1000);
      }
    });

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.role = role;
    $scope.servicePartners = servicePartners;
    $window.scope = $scope;

    $scope.toggleAll = function () {
      $scope.oneAtATime = !$scope.oneAtATime;
      if ($scope.oneAtATime) {
        $scope.accordion.genInfo.open = false;
        $scope.accordion.transfer.open = false;
      } else {
        $scope.accordion.genInfo.open = true;
        $scope.accordion.transfer.open = true;
      }
    };


    $scope.save = function () {
      $scope.submitting = true;
      TransferEditService.save($scope.transfer, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success",  $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        }
      });
    };


    $scope.destroy = function () {
      $scope.submitting = true;
      TransferEditService.destroy($scope.transfer, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.rejectButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        }
      });
    };

    $scope.filterTitleCase = function (input) {
      if (!input) { return; }
      var words = input.split(' ');
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
      }
      return words.join(' ');
    };

}]);
