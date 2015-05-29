angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts',
  function ($window, $scope, $location, AlertService, WorkOrders, workorder, units, customers, users, parts) {

    $scope.title = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    $scope.workorder = workorder || newWorkOrder();
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    $scope.$watch('workorder.types.pm', function (newVal) {
      console.log(newVal);
    });

    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory || true;
    };


    $scope.save = function () {
      $scope.submitting = true;
      WorkOrders.save($scope.workorder, function (err, data) {
        if (err) {
          data = { err: err, workorder: $scope.workorder };
          ErrorService(data);
          console.log(data);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        } else {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrders.destroy($scope.workorder, function (err, data) {
        if (err) {
          data = { err: err, workorder: $scope.workorder };
          ErrorService(data);
          console.log(data);
          AlertService.add("danger", "An error occurred while attempting to delete.");
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

    function getHours() {
      var hours = [];
      var i = 0;
      while (i <= 24) {
        hours.push(i);
        i++;
      }
      return hours;
    }

    function getMinutes() {
      var minutes = [];
      var i = 0;
      while (i < 60) {
        minutes.push(i);
        i+=5;
      }
      return minutes;
    }

    function newWorkOrder() {
      var newWO =
      {
        types: {
          pm: false,
          corrective: false,
          trouble:    false,
          newset:     false,
          release:    false,
          indirect:   false
        },

        header: {
          unitNumber:       "",
          customerName:     "",
          contactName:      "",
          county:           "",
          state:            "",
          leaseName:        "",
          rideAlong:        "",
          mileage:          "",
          applicationType:  ""
        },

        unitOwnership: {
          isRental: false,
          isCustomerUnit: false
        },

        billingInfo: {
          billableToCustomer: false,
          warrantyWork:       false,
          AFE:                false
        },

        misc: {
          leaseNotes: "",
          unitNotes:  "",
          JSA:        "",

          typeOfAsset:              "",
          isUnitRunningOnDeparture: false
        },

        unitReadings: {
          suctionPressure:        "",
          dischargePressure:      "",
          flowMCF:                "",
          rpm:                    "",
          dischargeTemp1:         "",
          dischargeTemp2:         "",
          hourReading:            "",
          compressorSerial:       "",
          engineSerial:           "",
          engineOilPressure:      "",
          alternatorOutput:       "",
          compressorOilPressure:  "",
          engineJWTemp:           "",
          engineManifoldVac:      ""
        },

        emissionsReadings: {
          afrmvTarget:      "",
          catalystTempPre:  "",
          catalystTempPost: "",
          permitNumber:     ""
        },

        pmChecklist: {

          killSettings: {
            highSuctionKill:        "",
            highDischargeKill:      "",
            lowSuctionKill:         "",
            lowDischargeKill:       "",
            highDischargeTempKill:  ""
          },

          engineChecks: {
            battery:            false,
            capAndRotor:        false,
            airFilter:          false,
            oilAndFilters:      false,
            magPickup:          false,
            belts:              false,
            guardsAndBrackets:  false,
            sparkPlugs:         false,
            plugWires:          false,
            driveLine:          false
          },

          generalChecks: {
            kills:                false,
            airHoses:             false,
            coolerForCracks:      false,
            coolerLouverMovement: false,
            coolerLouverCleaned:  false,
            scrubberDump:         false,
            plugInSkid:           false,
            filledDayTank:        false,
            fanForCracking:       false,
            panelWires:           false,
            oilPumpBelt:          false
          },

          fuelPressureFirstCut:   "",
          fuelPressureSecondCut:  "",
          visibleLeaksNotes:      "",
          engineCompression: {
            cylinder1: "",
            cylinder2: "",
            cylinder3: "",
            cylinder4: "",
            cylinder5: "",
            cylinder6: "",
            cylinder7: "",
            cylinder8: "",
          }
        },

        comments: {
          repairsDescription:  "",
          repairsReason:       "",
          calloutReason:       "",
          newsetNotes:         "",
          releaseNotes:        "",
          indirectNotes:       "",
          timeAdjustmentNotes: ""
        },

        laborCodes: {
          basic: {
            safety:         { hours: 0, minutes: 0 },
            lunch:          { hours: 0, minutes: 0 },
            custRelations:  { hours: 0, minutes: 0 },
            telemetry:      { hours: 0, minutes: 0 },
            environmental:  { hours: 0, minutes: 0 },
            diagnostic:     { hours: 0, minutes: 0 },
            serviceTravel:  { hours: 0, minutes: 0 },
            optimizeUnit:   { hours: 0, minutes: 0 },
            pm:             { hours: 0, minutes: 0 },
            washUnit:       { hours: 0, minutes: 0 },
            training:       { hours: 0, minutes: 0 },
          },

          engine: {
            oilAndFilter:     { hours: 0, minutes: 0 },
            addOil:           { hours: 0, minutes: 0 },
            compression:      { hours: 0, minutes: 0 },
            replaceEngine:    { hours: 0, minutes: 0 },
            replaceCylHead:   { hours: 0, minutes: 0 },
            replaceRadiator:  { hours: 0, minutes: 0 },
            fuelSystem:       { hours: 0, minutes: 0 },
            ignition:         { hours: 0, minutes: 0 },
            starter:          { hours: 0, minutes: 0 },
            lubrication:      { hours: 0, minutes: 0 },
            exhaust:          { hours: 0, minutes: 0 },
            alternator:       { hours: 0, minutes: 0 },
            driveOrCoupling:  { hours: 0, minutes: 0 },
            sealsAndGaskets:  { hours: 0, minutes: 0 },
          },
          emissions: {
            install: { hours: 0, minutes: 0 },
            test:    { hours: 0, minutes: 0 },
            repair:  { hours: 0, minutes: 0 }
          },
          panel: {
            panel:         { hours: 0, minutes: 0 },
            electrical:    { hours: 0, minutes: 0 }
          },
          compressor: {
            inspect:  { hours: 0, minutes: 0 },
            replace:  { hours: 0, minutes: 0 }
          },
          cooler: {
            cooling:  { hours: 0, minutes: 0 }
          },
          vessel: {
            dumpControl:  { hours: 0, minutes: 0 },
            reliefValve:  { hours: 0, minutes: 0 },
            suctionValve: { hours: 0, minutes: 0 }
          },
        },

        unit:     {},
        customer: {},
        worker:   {},
        county:   {},
        lease:    {},
      };
      return newWO;
    }
}]);
