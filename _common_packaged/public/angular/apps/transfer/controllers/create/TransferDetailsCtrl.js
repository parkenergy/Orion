angular.module('TransferApp.Controllers').controller('TransferDetailsCtrl',
['$scope', 'AlertService', 'LoaderService', 'Locations', 'Users', 'Units', 'GeographyService',
  function ($scope, AlertService, LoaderService, Locations, Users, Units, GeographyService) {

    $scope.$watch('transfer.transferType', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        resetStateData();
        switch (newVal) {
          case "SWAP":
              // Do everything necessary to show 2 units from same service partner.
              $scope.transfer.newLocation.customer.dbaCustomerName =
                $scope.transfer.unit.customer.dbaCustomerName;
              $scope.transfer.newLocation.servicePartner =
                $scope.transfer.unit.servicePartner;
            break;
          case "TRANSFER":
              // Show other leases, same service partner, potentially differnt customer.
              //TODO: no changes
            break;
          case "RELEASE":
              // Just show the yards
              $scope.transfer.newLocation.customer.dbaCustomerName =
                null;
              $scope.transfer.newLocation.servicePartner =
                $scope.transfer.unit.servicePartner;
            break;
          case "CONTRACT":
              // Allow the user to select all info.
            break;
          case "TEST":
              // Allow the user to select all info.
            break;
          case "REASSIGNMENT":
            $scope.transfer.OldServicePartnerId = $scope.transfer.unit.ServicePartnerId;
            $scope.transfer.reassignMultipleUnits = "false";
            break;
        }
      }
    }, true);

    $scope.$watch('transfer.newLocation.customer.dbaCustomerName',
    function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var type = $scope.transfer.transferType;

        if (type === "TRANSFER" || type === "CONTRACT" || type === "TEST") {
          // allow the user to select the customer

          var customerId;
          for (var i = 0, len = $scope.customers.length; i < len; i++) {
            if ($scope.customers[i].dbaCustomerName === newVal) {
              $scope.transfer.newLocation.customer = angular.copy($scope.customers[i]);
              customerId = $scope.transfer.newLocation.customer._id;
              $scope.transfer.newLocation.CustomerId = $scope.transfer.newLocation.customer._id;
            }
          }

          if (customerId) {
            $scope.locations = [];
            $scope.locationsLoading = true;
            Locations.query({ where: { CustomerId: customerId } },
              function (response) {
                $scope.locationsLoading = false;
                $scope.locations = filterLocationsByTransferType(response);
                $scope.locations.push({id: null, name: "Other"});
              },
              function (err) {
                $scope.locationsLoading = false;
                AlertService.add("error", err);
              }
            );
          }

        } else if (type === "RELEASE" || type === "SWAP") {
          // customer is preselcted, just load the yards for the service partner
          var servicePartnerId = $scope.transfer.newLocation.servicePartner._id;
          Locations.query({ where: { ServicePartnerId: servicePartnerId } },
            function (response) {
              $scope.locationsLoading = false;
              $scope.locations = filterLocationsByTransferType(response);
              if (type === "RELEASE") {
                $scope.locations.push({id: null, name: "Other"});
              }
            },
            function (err) {
              $scope.locationsLoading = false;
              AlertService.add("error", err);
            }
          );
        }
      }
    }, true);

    $scope.$watch('transfer.NewLocationId',
    function (newVal, oldVal) {
      if (newVal !== oldVal && newVal !== null) {
        for (var i = 0, len = $scope.locations.length; i < len; i++) {
          if ($scope.locations[i]._id === newVal) {
            $scope.allowFreehandLocation = false;
            $scope.transfer.freehandLocationCustomerId = null;
            $scope.transfer.freehandLocationName = null;
            $scope.transfer.freehandLocationCounty = null;
            $scope.transfer.newLocation = angular.copy($scope.locations[i]);
            break;
          }
        }
        if ($scope.transfer.transferType === "SWAP") {
          Units.query({ where: { LocationId: newVal } },
            function (response) {
              $scope.unitsLoading = false;
              $scope.swapUnits = response;
            },
            function (err) {
              $scope.unitsLoading = false;
              AlertService.add("error", err);
            }
          );
        }
      } else if (newVal !== oldVal && newVal === null) {
        $scope.allowFreehandLocation = true;
        if ($scope.transfer.newLocation) {
          $scope.transfer.freehandLocationCustomerId =
            $scope.transfer.newLocation.customer._id;
        }
      }
    }, true);

    $scope.$watch('transfer.NewServicePartnerId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var id = newVal;
        if ( ($scope.transfer.transferType === "TRANSFER" ||
              $scope.transfer.transferType === "RELEASE") &&
              $scope.transfer.isYardTransfer === "true") {

          $scope.locations = [];
          $scope.locationsLoading = true;
          Locations.query({ where: { ServicePartnerId: id, locationType: "Yard" } },
            function (response) {
              $scope.locationsLoading = false;
              $scope.locations = filterLocationsByTransferType(response);
            },
            function (err) {
              $scope.locationsLoading = false;
              AlertService.add("error", err);
            }
          );

        } else {

          $scope.newTechniciansLoading = true;
          if ($scope.transfer.isNewLocation) {
            $scope.transfer.newLocation.ServicePartnerId = id;
          }
          var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
          Users.query({ where: obj },
            function (response) {
              $scope.technicians = response;
              obj = { ServicePartnerId: id, role: "REVIEWER" };
              Users.query({ where: obj },
                function (response) {
                  $scope.technicians = $scope.technicians.concat(response);
                  $scope.techniciansLoading = false;
                },
                function (err) {
                  AlertService.add("danger", err);
                });
            },
            function (err) {
              AlertService.add("danger", err);
            });

        }
      }
    }, true);

    $scope.$watch('transfer.NewTechnicianId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.transfer.isNewLocation) {
          $scope.technicians = $scope.newTechnicians;
          $scope.transfer.TechnicianId = newVal;
          $scope.transfer.technician = $scope.technicians.filter(function (m) {
            return m._id === newVal;
          })[0];
        }
      }
    }, true);

    $scope.$watch('transfer.SwapUnitId', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.swapUnits) {
        for (var i = 0, len = $scope.swapUnits.length; i < len; i++) {
          if ($scope.swapUnits[i]._id === newVal) {
            $scope.transfer.swapUnit = angular.copy($scope.swapUnits[i]);
          }
        }
      }
    });

    $scope.$watch('transfer.isNewLocation', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.transfer.newLocation) {
        var state = $scope.transfer.newLocation.state;
        $scope.counties = GeographyService.counties(state);
      }
    });

    $scope.$watch('transfer.newLocation.state', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.transfer.isNewLocation) {
        $scope.transfer.newLocation.county = null;
        $scope.counties = GeographyService.counties(newVal);
      }
    });


    function filterLocationsByTransferType (locations) {
      var type = $scope.transfer.transferType;
      var newLocations = locations.filter(function (location) {

        var shouldBeIncluded = true;

        if (type === "SWAP" || type === "RELEASE") {
          if (location.locationType === "Lease" || location.locationType === "Truck") {
            shouldBeIncluded = false;
          }
        }

        if (type === "CONTRACT" || type === "TEST") {
          if (location.locationType === "Yard" || location.locationType === "Truck") {
            shouldBeIncluded = false;
          }
        }

        return shouldBeIncluded;
      });
      return newLocations;
    }

    function resetStateData() {
      if ($scope.transfer.newLocation) {
        $scope.transfer.newLocation.customer.dbaCustomerName = null;
        $scope.transfer.newLocation.servicePartner = null;
      }
      $scope.transfer.OldServicePartnerId = null;
      $scope.transfer.reassignMultipleUnits = null;
    }

}]);
