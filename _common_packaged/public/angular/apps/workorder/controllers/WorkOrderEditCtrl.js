angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', '$modal', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'counties', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, AlertService, WorkOrders, workorder, units, customers, users, parts, counties, applicationtypes) {

    $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    $scope.workorder = workorder || newWorkOrder();

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.counties = counties;
    $scope.applicationtypes = applicationtypes;
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

    $scope.$watch(
      function () { return $scope.workorder.header.unitNumber; },
      function ( newValue, oldValue ) {
        $scope.workorder.header.customerName = $scope.workorder.header.unitNumber.Customer;
        $scope.workorder.header.state = $scope.workorder.header.unitNumber.state;
        $scope.workorder.header.county = $scope.workorder.header.unitNumber.county;
        $scope.workorder.header.leaseName = $scope.workorder.header.unitNumber.locationName;
      }
    );

    // First array should only be checkable when PM is selected.
    // Secord array should not allow this.
    $scope.workorderTypes1 = ['Corrective', 'Trouble Call'];
    $scope.workorderTypes2 = ['New Set', 'Release', 'Indirect'];

    $scope.highMileageConfirm = false;

    $scope.save = function () {
      $scope.submitting = true;
      console.log($scope.workorder);
      $scope.allowSubmit = true;
      if($scope.workorder.header.startMileage >  $scope.workorder.header.endMileage){
        $scope.openErrorModal('woMileageError.html');
        $scope.allowSubmit = false;
      }
      if($scope.unaccoutedHours > 0 || $scope.unaccountedMinutes > 15){
        $scope.openErrorModal('woUnaccoutedTimeError.html');
        $scope.allowSubmit = false;
      }
      if(($scope.workorder.header.endMileage - $scope.workorder.header.startMileage) > 75 && !$scope.highMileageConfirm){
        $scope.openConfirmationModal('woHighMileageConfirmation.html');
        $scope.allowSubmit = false;
      }
      if($scope.allowSubmit){
        WorkOrders.save({_id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            AlertService.add("success", "Save was successful!");
            $scope.submitting = false;
            $location.path("/");
          },
          function (err) {
            console.log(err);
            AlertService.add("danger", "An error occurred while attempting to save.");
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrders.delete({id: workorder._id},
        function (response) {
          $location.path("/myaccount");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
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
      $timeout(function () { $scope.getTimeElapsed(); }, 300);
    };

    $scope.getTotalLaborTime = function(){
      $scope.totalHours = 0;
      $scope.totalMinutes = 0;
      angular.forEach($scope.workorder.laborCodes.basic, function(code){
        //alert(value.hours);
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      $scope.totalHours -= $scope.workorder.laborCodes.basic.negativeAdj.hours;
      $scope.totalMinutes -= $scope.workorder.laborCodes.basic.negativeAdj.minutes;
      if($scope.totalMinutes > 60)
      {
        $scope.totalHours += ($scope.totalMinutes / 60);
        $scope.totalHours = Math.floor($scope.totalHours);
        $scope.totalMinutes = $scope.totalMinutes % 60;
      }
      $timeout(function () { $scope.getTotalLaborTime(); }, 300);
    };

    $scope.getUnaccountedTime = function(){
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
                  new Date($scope.workorder.timeSubmitted) :
                  new Date();
      var h = String("0"+Math.floor(Math.abs(now-start)/36e5) - $scope.totalHours - $scope.workorder.laborCodes.basic.negativeAdj.hours).slice(-2);
      var m = String("0"+Math.floor((Math.abs(now-start)/6e4)%60) - $scope.totalMinutes - $scope.workorder.laborCodes.basic.negativeAdj.minutes).slice(-2);
      //var s = String("0"+Math.floor((Math.abs(now-start)/1e3)%60)).slice(-2);
      $scope.unaccountedTime = h+":"+m+":00";
      $scope.unaccoutedHours = Math.floor(Math.abs(now-start)/36e5) - $scope.totalHours - $scope.workorder.laborCodes.basic.negativeAdj.hours;
      $scope.unaccountedMinutes = Math.floor((Math.abs(now-start)/6e4)%60) - $scope.totalMinutes - $scope.workorder.laborCodes.basic.negativeAdj.minutes;
      $timeout(function () { $scope.getUnaccountedTime(); }, 300);
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
        i+=15;
      }
      return minutes;
    }

    function newWorkOrder() {
      var newWO =
      {

        timeStarted: new Date(),
        timeSubmitted: null,
        timeApproved: null,

        pm: false,
        type: "",

        header: {
          unitNumber:       {
            number: ""
          },
          customerName:     "",
          contactName:      "",
          county:           "",
          state:            "",
          leaseName:        "",
          rideAlong:        "",
          mileage:          "",
          applicationtype:  ""
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
            positiveAdj:    { hours: 0, minutes: 0 },
            negativeAdj:    { hours: 0, minutes: 0 },
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

        parts: [],

        jsa: {}

      };
      return newWO;
    }

  	/* Model for the add part table
  	--------------------------------------------------------------------------- */
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
      $scope.workorder.parts.push({
        number:       part.number,
        description:  part.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false
      });
    }

    $scope.removePart = function (part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openErrorModal = function(modalUrl){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ErrorCtrl'
      });
    };

    $scope.openConfirmationModal = function(modalUrl){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ConfirmationCtrl'
      });

      modalInstance.result.then(function (){
        //$scope.allowSubmit = true;
        $scope.highMileageConfirm = true;
        $scope.save();
      });
    };

    $scope.openLeaseNotes = function(){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function(){
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function(){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function(){
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function(){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function(){
            return $scope.workorder.jsa;
          }
        }
      });

      modalInstance.result.then(function (jsa){
        $scope.workorder.jsa = jsa;
      });
    };

    $scope.openManualPartModal = function(){
      var modalInstance = $modal.open({
        templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/parts/woManualAddModal.html',
        controller: 'AddPartModalCtrl'
      });

      modalInstance.result.then(function (part){
        $scope.workorder.parts.push({
          number: part.number,
          description: part.description,
          cost: 0,
          laborCode: "",
          quantity: 0,
          isBillable: false,
          isWarranty: false
        });
      });
    };

    $scope.getTimeElapsed();

    $scope.getTotalLaborTime();

    $scope.getUnaccountedTime();
}]);

angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
function( $scope, $modalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function(){
    $modalInstance.close($scope.notes);
  };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function( $scope, $modalInstance, jsa ){
  $scope.jsa= jsa;

  $scope.ok = function(){
    $modalInstance.close($scope.jsa);
  };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartModalCtrl',
function( $scope, $modalInstance){
  $scope.part = {};

  $scope.addPart = function(){
    $modalInstance.close($scope.part);
  };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function($scope, $modalInstance){
  $scope.ok = function(){
    $modalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function($scope, $modalInstance){
  $scope.confirm = function(){
    $modalInstance.close(true);
  };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };
});
