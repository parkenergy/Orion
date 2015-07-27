angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts',
  function ($window, $scope, $location, $timeout, AlertService, WorkOrders, workorder, units, customers, users, parts) {

    $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    $scope.workorder = workorder || newWorkOrder();
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory || true;
    };

    $scope.$watch('workorder', function (newVal, oldVal) {
      if (newVal !== oldVal && !$scope.workorder.timeSubmitted) {
        $scope.submitting = true;
        WorkOrders.save({_id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log(response);
            $scope.workorder._id = $scope.workorder._id || response._id;
            $location.path("/workorder/edit/" + $scope.workorder._id, false);
            $scope.submitting = false;
          },
          function (err) {
            console.log(err);
            console.log("An error occurred while attempting to save.");
            $scope.submitting = false;
          }
        );
      }
    }, true);


    $scope.save = function () {
      $scope.submitting = true;
      console.log($scope.workorder);
      WorkOrders.save({_id: $scope.workorder._id}, $scope.workorder,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrders.destroy($scope.workorder,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };

    $scope.getTimeElapsed = function () {
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
                  new Date($scope.workorder.timeSubmitted) :
                  new Date();
      var h = String("0"+Math.floor(Math.abs(now-start)/36e5)).slice(-2);
      var m = String("0"+Math.floor((Math.abs(now-start)/6e4)%60)).slice(-2);
      var s = String("0"+Math.floor((Math.abs(now-start)/1e3)%60)).slice(-2);
      $scope.timeElapsed = h+":"+m+":"+s;
      $timeout(function () { $scope.getTimeElapsed(); }, 1000);
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

        timeStarted: new Date(),
        timeSubmitted: null,
        timeApproved: null,

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

        parts: []
      };
      return newWO;
    }

    function addPart(obj) {
      $scope.workorder.parts.push({
        number:       obj.number,
        description:  obj.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false
      });
    }

    $scope.manualPart = {};
    $scope.addPartManually = function () {
      $scope.workorder.parts.push({
        number:       $scope.manualPart.number,
        description:  $scope.manualPart.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false
      });
      $scope.manualPart = {};
    };

  	/* Model for the add part table
  	--------------------------------------------------------------------------- */
    $scope.partsTableModel = {
      tableName: "Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "number" },
        { title: "Description", objKey: "description" }
      ],
  		rowClickAction: null,
      rowButtons: [{title: "add", action: addPart}],
      headerButtons: null, // an array of button object (format below)
  		sort: { column: ["number"], descending: false }
    };

    $scope.removePart = function (obj) {
      var ind = _.findWhere($scope.workorder.parts, obj);
      var arr =  _.without($scope.workorder.parts, ind);
      $scope.workorder.parts = arr;
    };

    $scope.getTimeElapsed();
}]);
