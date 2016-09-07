angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'counties', 'states', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, workorder, units, customers, users, parts, counties, states, applicationtypes) {

    $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    // scope holding objects.
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.counties = counties;
    $scope.states = states;
    $scope.applicationtypes = applicationtypes;
    $scope.workorder = workorder;

    $scope.hours = getHours();
    $scope.minutes = getMinutes();
    $scope.pad = TimeDisplayService.pad;

    /* maybe?
     var resumeWorkOrderId = null;
      workorders.forEach(function (wo) {
        if (!wo.timeSubmitted && wo.technician === $scope.user) {
          console.log('Resume Workorder');
          resumeWorkOrderId = wo._id;
        }
      });
      $location.path("/workorder/edit/" + (resumeWorkOrderId || ''));*/
    /*
      // goes with history html file NOT BEING USED.
    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory || true;
    };*/
    // every change calls this watch.
    console.log($scope.workorder);
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

//============================================================================
    // Client runs on angular 1.2.29 which the code there works and Orion is on 1.3.20 wich that code on the client has been changed. This is the only way without having to disable other checkboxes on change.
    $scope.type = [
      { text: "Corrective", value: false },
      { text: "Trouble Call", value: false },
      { text: "New Set", value: false },
      { text: "Release", value: false },
      { text: "Indirect", value: false }
    ]

    // If the object is set to true, set type to that obj, and clear all other types.
    $scope.setTypes = function(obj){
      if(obj.value === true){
        $scope.workorder.type = obj.text;
        $scope.type.forEach(function(i){
          if(i.text !== obj.text){
            i.value = false;
          }
        });
      }
    };

    $scope.nonPmType = function(){
      if($scope.workorder.pm){
        $scope.workorder.pm = false;
      }
    };

    // This is ran any time there is a change to the PM checkbox
    $scope.pmChange = function(pm){
      if(pm === true){
        if ($scope.workorder.type === 'New Set' || $scope.workorder.type === 'Release' || $scope.workorder.type === 'Indirect') {
          $scope.workorder.type = '';
          // don't clear corrective or trouble call if either is set.
          $scope.type[2].value = false; // new set
          $scope.type[3].value = false; // release
          $scope.type[4].value = false; // indirect
        }
      }
    }

    // Triggered on change to specific checkbox but all but PM call this function, if a pm type just set it. if not a pm type make pm false if true then set.
    $scope.typeChange = function(obj){
      console.log(obj.value);
      if(obj.text === "Corrective" || obj.text === "Trouble Call"){
        $scope.setTypes(obj);
      }else{
        $scope.nonPmType();
        $scope.setTypes(obj);
      }
    }

    // on page load set checkboxes
    if($scope.workorder.pm){
      // you can have either Corrective or Trouble Call selected at the same time you have PM selected but only one
      if($scope.workorder.type === "Corrective"){
        $scope.type[0].value = true;
      }else if($scope.workorder.type === "Trouble Call"){
        $scope.type[1].value = true;
      }
    }else{
      // otherwise PM is not selected in that case only one of the fallowing can be selected.
      switch($scope.workorder.type){
        case "Corrective":
          $scope.type[0].value = true;
          break;
        case "Trouble Call":
          $scope.type[1].value = true;
          break;
        case "New Set":
          $scope.type[2].value = true;
          break;
        case "Release":
          $scope.type[3].value = true;
          break;
        case "Indirect":
          $scope.type[4].value = true;
          break;
        default:
          console.log($scope.workorder.type);
      }
    }
//============================================================================

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
            $location.path("/myaccount");
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

    $scope.usedLaborCodes = [];
      // set usedLaborCodes array with every used labor code with the text of that labor code
      $scope.getUsedLaborCodes = function () {
        angular.forEach($scope.workorder.laborCodes, function (lc) {
          angular.forEach(lc, function (code) {
            if (code.hours > 0 || code.minutes > 0) {
              if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
                $scope.usedLaborCodes.push(code.text);
              }
            }
          });
        });
        $timeout(function () {
          $scope.getUsedLaborCodes();
        }, 300);
      };

    // TimeDisplayService handles all time display issues with HH:MM
    // refactored 9.5.16
    $scope.getTimeElapsed = function () {
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
        new Date($scope.workorder.timeSubmitted) :
        new Date();
      // e short for elapsed
      $scope.eMilli = (now.getTime() - start.getTime()).toFixed();
      $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60));
      $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)));
      $scope.eHours = Math.floor((($scope.eMilli / (36e5))));

      $timeout(function () { $scope.getTimeElapsed(); }, 300);
    };

    // get total wo time based on used labor codes
    // refactored 9.5.16
    $scope.getTotalLaborTime = function () {
      $scope.laborH = 0;
      $scope.laborM = 0;
      $scope.totalMinutes = 0;
      angular.forEach($scope.workorder.laborCodes, function (lc) {
        angular.forEach(lc, function (code) {
          if (code.text == 'Negative Adjustment') {
            $scope.totalMinutes -= code.hours * 60;
            $scope.totalMinutes -= code.minutes;
          } else {
            $scope.totalMinutes += code.hours * 60;
            $scope.totalMinutes += code.minutes;
          }
        });
      });
      $scope.laborH = parseInt($scope.totalMinutes / 60);
      $scope.laborM = Math.round($scope.totalMinutes % 60);
      $scope.totalLabor = TimeDisplayService.timeManager($scope.laborH,$scope.laborM);

      $timeout(function () { $scope.getTotalLaborTime(); }, 300);
    };

     // get unaccounted for time based on used labor coded and elapsed time FIX
    // refactored 9.5.16
    $scope.getUnaccountedTime = function () {
      $scope.unaccountedM = ($scope.eHours - $scope.laborH)*60;
      $scope.unaccountedM += $scope.eMinutes - $scope.laborM;
      $scope.unaccountedH = parseInt($scope.unaccountedM/60);
      $scope.unaccountedM = Math.round($scope.unaccountedM%60);
      $scope.unaccountedTime = TimeDisplayService.timeManager($scope.unaccountedH,$scope.unaccountedM);

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

    // function getTechnician(){
    //   var techId = $cookies.get('userId');
    //   return techId;
    // }

     /* Populate search field for parts
      --------------------------------------------------------------------------- */
      parts = parts.map(function (part) {
        part.searchStr = [part.description, part.componentName, part.MPN].join(' ');
        return part;
      });

  	/* Model for the add part table
  	--------------------------------------------------------------------------- */
    $scope.partsTableModel = {
      tableName: "Search For Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "MPN", objKey: "MPN" },
        { title: "Description", objKey: "description" }
      ],
  		rowClickAction: addPart,
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
  		sort: { column: ["number"], descending: false }
    };

    function addPart(part) {
      $scope.workorder.parts.push({
        vendor:       part.vendor,
        number:       part.number,
        description:  part.description,
        cost:         0,
        laborCode:    "",
        quantity:     0,
        isBillable:   false,
        isWarranty:   false,
        netsuiteId:   part.netsuiteId
      });
    }

    $scope.removePart = function (part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openErrorModal = function (modalUrl){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ErrorCtrl'
      });
    };

    $scope.openConfirmationModal = function (modalUrl){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
        controller: 'ConfirmationCtrl'
      });

      modalInstance.result.then(function (){
        //$scope.allowSubmit = true;
        $scope.highMileageConfirm = true;
        $scope.save();
      });
    };

    $scope.openLeaseNotes = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woLeaseNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.leaseNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.leaseNotes = notes;
      });
    };

    $scope.openUnitNotes = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woUnitNotesModal.html',
        controller: 'NotesModalCtrl',
        resolve: {
          notes: function (){
            return $scope.workorder.misc.unitNotes;
          }
        }
      });

      modalInstance.result.then(function (notes){
        $scope.workorder.misc.unitNotes = notes;
      });
    };

    $scope.openJSA = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woJsaModal.html',
        controller: 'JsaModalCtrl',
        windowClass: 'jsa-modal',
        resolve: {
          jsa: function (){
            return $scope.workorder.jsa;
          }
        }
      });

      modalInstance.result.then(function (jsa){
        $scope.workorder.jsa = jsa;
      });
    };

    $scope.openManualPartModal = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woManualAddModal.html',
        controller: 'AddPartModalCtrl'
      });

      modalInstance.result.then(function (part){
        $scope.workorder.parts.push({
          vendor: part.vendor,
          number: part.number,
          description: part.description,
          cost: part.cost,
          laborCode: "",
          quantity: 0,
          isBillable: false,
          isWarranty: false,
          isManual: true
        });
      });
    };

    $scope.getUsedLaborCodes();

    $scope.getTimeElapsed();

    $scope.getTotalLaborTime();

    $scope.getUnaccountedTime();
}]);

angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
function ( $scope, $modalInstance, notes){
  $scope.notes = notes;

  $scope.ok = function (){
    $modalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaModalCtrl',
function ( $scope, $modalInstance, jsa ){
  $scope.jsa = jsa;

  $scope.ok = function (){
    $modalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartModalCtrl',
function ( $scope, $modalInstance){
  $scope.part = {};

  $scope.addPart = function (){
    $modalInstance.close($scope.part);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function ($scope, $modalInstance){
  $scope.ok = function (){
    $modalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function ($scope, $modalInstance){
  $scope.confirm = function (){
    $modalInstance.close(true);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});
