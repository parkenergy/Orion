angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'assettypes', 'units', 'customers', 'users', 'me', 'parts', 'counties', 'states', 'applicationtypes',
function ($window, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, GeneralPartSearchService, ObjectService, CommonWOfunctions, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, assettypes, units, customers, users, me, parts, counties, states, applicationtypes) {

  $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

  // scope holding objects.
  $scope.units = units;
  $scope.customers = customers;
  $scope.users = users;
  $scope.me = me;
  $scope.parts = parts;
  $scope.counties = counties;
  $scope.assettypes = assettypes;
  $scope.states = states;
  $scope.applicationtypes = applicationtypes;
  $scope.workorder = workorder;
  $scope.reviewNotes = reviewNotes;
  $scope.editHistories = editHistories;
  $scope.unitValid = null;
  $scope.displayAssetType = '';

  $scope.hours = getHours();
  $scope.minutes = getMinutes();
  $scope.pad = TimeDisplayService.pad;

  // Arrays for individual collecitons
  $scope.customersArray = [];
  $scope.countiesArray = [];
  $scope.statesArray = [];

  // Arrays of values. search once on page load.
  $scope.unitNumberArray = [];
  $scope.unitCustomerArray = [];
  $scope.unitLocationArray = [];
  $scope.unitCountiesArray = [];
  $scope.unitStateArray = [];
  // Array for rideAlong and app types
  $scope.userRideAlongArray = [];

  $scope.SyncedToNetsuite = $scope.workorder.timeSynced || $scope.workorder.updated_at;

  // map users first and lastname into userRideAlongArray
  _.map($scope.users,function(obj){
    $scope.userRideAlongArray.push(obj.firstName.concat(" ").concat(obj.lastName));
  });
    // the rest of the arrays filled for individual quering. IE not associated with unit #
    // kept seperate just in case we need to pull anything from these objects later.
  _.map($scope.counties,function(obj){
    $scope.countiesArray.push(obj.name);
  });
  _.map($scope.customers,function(obj){
    $scope.customersArray.push(obj.name);
  });
  _.map($scope.states,function(obj){
    $scope.statesArray.push(obj.name);
  });
  // map and fill all arrays so they can easily be sorted and called upon, indexes match up.
  _.map($scope.units,function(obj){
    $scope.unitNumberArray.push(obj.number);
    $scope.unitCustomerArray.push(obj.customerName);
    $scope.unitLocationArray.push(obj.locationName);
    if(obj.county){
      $scope.unitCountiesArray.push(obj.county.name);
    }else{
      $scope.unitCountiesArray.push("");
    }
    if(obj.state){
      $scope.unitStateArray.push(obj.state.name);
    }else{
      $scope.unitStateArray.push("");
    }
  });

  // Add componentName to Pars in WO for listing --------
  $scope.workorder = CommonWOfunctions.addComponentNameToParts($scope.workorder, $scope.parts);
  // ----------------------------------------------------

  // return user object from id
  function getUser(id){
   for(var i = 0; i < $scope.users.length; i++){
     if($scope.users[i].username === id){
       return $scope.users[i];
     }
   }
  }

  // Passed function to Components ------------------
  // select-list
  $scope.changeThisSelectList = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // typeahead
  $scope.changeThisTypeahead = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.workorder,changedData, selected);
  };

  // check-box
  $scope.changeThisCheckbox = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // text-field
  $scope.changeThisTextField = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // text-area-field
  $scope.changeThisTextAreaField = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };
  // ------------------------------------------------
  
  // Return the NSID of referenced AssetType -------
  $scope.getAssetTypeNSID = function (name) {
    var returnId = '';
    _.forEach($scope.assettypes, function (doc) {
      if(name === doc.type){
        returnId =  doc.netsuiteId;
      }
    });
    return returnId;
  };
  // ------------------------------------------------
  
  // Auto fill for header information
  $scope.$watch('workorder.header.unitNumber', function (newVal, oldVal) {

    //set $scope.workorder.unit to null if certain params are met.
    if($scope.workorder.unit && (newVal !== oldVal)){
      $scope.workorder.unit = null;
      $scope.workorder.assetType = null;
    }
    // needed to auto fill the header on the correct unit number
    if(newVal !== oldVal){ // also keep from filling in with old workorder unit on page reload
      var unitNumberIndex = $scope.unitNumberArray.indexOf(newVal);
      if(unitNumberIndex !== -1){
        $scope.workorder.header.state = $scope.unitStateArray[unitNumberIndex];
        $scope.workorder.header.county = $scope.unitCountiesArray[unitNumberIndex];
        $scope.workorder.header.leaseName = $scope.unitLocationArray[unitNumberIndex];
        $scope.workorder.header.customerName = $scope.unitCustomerArray[unitNumberIndex];
        $scope.workorder.header.unitNumber = $scope.unitNumberArray[unitNumberIndex];
        $scope.workorder.unit = $scope.units[unitNumberIndex];
        $scope.workorder.assetType = $scope.getAssetTypeNSID($scope.workorder.unit.productSeries);
        $scope.displayAssetType = $scope.workorder.unit.productSeries;
        // Auto poplulate JSA customer and location
        $scope.workorder.jsa.location = $scope.unitLocationArray[unitNumberIndex];
        $scope.workorder.jsa.customer = $scope.unitCustomerArray[unitNumberIndex];
      } else {
        // clear both location and customer from jsa if unit does not exist.
        $scope.workorder.jsa.customer = '';
        $scope.workorder.jsa.location = '';
      }
    }
    $scope.workorder.unitNumber = $scope.workorder.header.unitNumber;
  });

  $scope.$watch('workorder.laborCodes.basic',function(newVal, oldVal){
    if(
      $scope.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
      $scope.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
      $scope.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
      $scope.workorder.laborCodes.basic.negativeAdj.minutes > 0){
      $scope.timeAdjustment = true;
    } else {
      $scope.timeAdjustment = false;
    }
  }, true);

  //============================================================================
  // Client runs on angular 1.2.29 which the code there works and Orion is on 1.3.20 wich that code on the client has been changed. This is the only way without having to disable other checkboxes on change.
  $scope.type = [
    { text: "Corrective", value: false },
    { text: "Trouble Call", value: false },
    { text: "New Set", value: false },
    { text: "Release", value: false },
    { text: "Indirect", value: false }
  ];

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
  };

  // Triggered on change to specific checkbox but all but PM call this function, if a pm type just set it. if not a pm type make pm false if true then set.
  $scope.typeChange = function(obj){
    if(obj.text === "Corrective" || obj.text === "Trouble Call"){
      $scope.setTypes(obj);
    }else{
      $scope.nonPmType();
      $scope.setTypes(obj);
    }
  };

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

//----------------------------------------------------------------------
// NOTES
// Create an [] to display all notes in database and easily push to on save if saved.

  // init display notes with an empty array.
  $scope.displayNotes = [];
  // the schema is described here for that empty array to be filled with these objects.
  function ClassDisplayNote() {
    return {
      firstname: '',
      lastname: '',
      note: '',
      workOrder: null,
      updated_at: Date
    };
  }
  // load all notes that are in the database.
  _.map($scope.reviewNotes, function(comment){
    // make sure there is even a comment to look at and that it matches up with this workorder
    if($scope.workorder._id === comment.workOrder){
      var thisUser = getUser(comment.user);
      var thisNote = ClassDisplayNote();
      thisNote.firstname = thisUser.firstName;
      thisNote.lastname = thisUser.lastName;
      thisNote.note = comment.note;
      thisNote.updated_at = comment.updated_at;
      $scope.displayNotes.push(thisNote);
    }
  });
//-------------------------------------------------------------------------
// create single object to hold single note to push to the database and the display array if saved correctly.

  // create object model to data bind comment input to.
  $scope.comment = ClassNote();
  // create model object to work off of
  function ClassNote() {
    return {
      note: '',
      workOrder: $scope.workorder._id
    };
  }
  // boolean value to keep from editing note while it is sending
  $scope.sendingNote = false;
  // save the new note to the database
  $scope.newNote = function(){
    // save to database will go here only if comment was filled
    if($scope.comment.note){
      $scope.sendingNote = true;
      // save to database
      console.log("Saving new note...");
      ReviewNotes.save({}, $scope.comment,
        function (response) {
          $scope.sendingNote = false;
          console.log(response);
          console.log("Successful save.");
          // save note to display.
          var displayNote = ClassDisplayNote();
          displayNote.firstname = $scope.me.firstName;
          displayNote.lastname = $scope.me.lastName;
          displayNote.note = $scope.comment.note;
          displayNote.updated_at = response.updated_at;
          $scope.displayNotes.unshift(displayNote);
          // clear display note from form
          $scope.comment.note = null;
        },
        function (err) {
          $scope.sendingNote = false;
          console.log(err);
          console.log("Error Saving Note.");
          $scope.comment.note = null;
        }
      );
    }
  };

//-----------------------------------------------------------------------
// Submissions
// make the display for all submission history
  $scope.displaySubmissions = [];

  //create display class for Submissions
  function ClassSubmission(){
    return {
      type: '',
      firstname: '',
      lastname: '',
      submissionTime: Date
    };
  }

  // only do if tech has submitted wo.
  if($scope.workorder.timeSubmitted){
    // Tech Submission
    var thisUser = getUser($scope.workorder.techId);
    var techSubmission = ClassSubmission();
    techSubmission.type = "Submission";
    // if user no longer exists. Deleted from db
    if(thisUser !== undefined){
      techSubmission.firstname = thisUser.firstName;
      techSubmission.lastname = thisUser.lastName;
    } else {
      techSubmission.firstname = $scope.workorder.techId;
    }
    techSubmission.submissionTime = $scope.workorder.timeSubmitted;
    $scope.displaySubmissions.push(techSubmission);
    // Manager Review
    if($scope.workorder.timeApproved){
      thisUser = getUser($scope.workorder.approvedBy);
      var managerSubmission = ClassSubmission();
      managerSubmission.type = "Reviewed";
      managerSubmission.firstname = thisUser.firstName;
      managerSubmission.lastname = thisUser.lastName;
      managerSubmission.submissionTime = $scope.workorder.timeApproved;
      $scope.displaySubmissions.push(managerSubmission);
    }
    // ADMIN SYNC
    if($scope.workorder.timeSynced){
      thisUser = getUser($scope.workorder.syncedBy);
      var adminSubmission = ClassSubmission();
      adminSubmission.type = "Synced";
      adminSubmission.firstname = thisUser.firstName;
      adminSubmission.lastname = thisUser.lastName;
      adminSubmission.submissionTime = $scope.workorder.timeSynced;
      $scope.displaySubmissions.push(adminSubmission);
    }
  }

//-----------------------------------------------------------------------
// History Changes
// create the view for all edits
  $scope.displayChanges = [];

  function ClassDisplayHistory() {
    return {
      panelName: '',
      itemName: '',
      type: '',
      before: '',
      after: ''
    };
  }
  // load all edits from the database
  _.map($scope.editHistories, function(edit){
    // format the data correctly for presentation.
    if($scope.workorder._id === edit.workOrder){
      var thisEdit = ClassDisplayHistory();
      thisEdit.panelName = edit.path[0];
      thisEdit.itemName = edit.path.pop();
      thisEdit.type = edit.editType;
      thisEdit.before = edit.before;
      thisEdit.after = edit.after;
      $scope.displayChanges.push(thisEdit);
    }
  });
  // load the username of the admin who made the edits. and get the count
  if($scope.editHistories.length !== 0){
    $scope.editor = getUser($scope.editHistories.pop().user);
    $scope.editCount = $scope.editHistories.length + 1;
  }

//-----------------------------------------------------------------------

  $scope.highMileageConfirm = false;

  $scope.save = function () {
    $scope.submitting = true;
    console.log($scope.workorder);
    $scope.allowSubmit = true;
    if($scope.workorder.header.startMileage >  $scope.workorder.header.endMileage){
      $scope.openErrorModal('woMileageError.html');
      $scope.allowSubmit = false;
    }
    if((($scope.unaccountedH < 0 || $scope.unaccountedM < -15) || ($scope.unaccountedH > 0 || $scope.unaccountedM > 15)) && $scope.timeAdjustment === false){
      $scope.openErrorModal('woUnaccoutedTimeError.html');
      $scope.allowSubmit = false;
    }
    if(($scope.workorder.header.endMileage - $scope.workorder.header.startMileage) > 75 && !$scope.highMileageConfirm){
      $scope.openConfirmationModal('woHighMileageConfirmation.html');
      $scope.allowSubmit = false;
    }

    if($scope.allowSubmit){
      if($cookies.get('role') === "admin"){
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            AlertService.add("success", "Update was successful!");
              $scope.submitting = false;
              $location.path("/workorder/review/" + $scope.workorder._id);
          },
          function (err) {
            console.log(err);
              AlertService.add("danger", "An error occurred while attempting to update.");
              $scope.submitting = false;
          }
        );
      }
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
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'wo',$scope.workorder);

  $scope.removePart = function (part) {
    var index = $scope.workorder.parts.indexOf(part);
    $scope.workorder.parts.splice(index, 1);
  };

  $scope.openErrorModal = function (modalUrl){
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
      controller: 'ErrorCtrl'
    });
  };

  $scope.openConfirmationModal = function (modalUrl){
    var modalInstance = $uibModal.open({
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
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woLeaseNotesModal.html',
      controller: 'NotesEditModalCtrl',
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
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woUnitNotesModal.html',
      controller: 'NotesEditModalCtrl',
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
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woJsaModal.html',
      controller: 'JsaEditModalCtrl',
      windowClass: 'jsa-modal',
      resolve: {
        jsa: function (){
          return $scope.workorder.jsa;
        }
      }
    });

    modalInstance.result.then(function (jsa) {
      $scope.workorder.jsa = jsa;
    });
  };

  $scope.openManualPartModal = function (){
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woManualAddModal.html',
      controller: 'AddPartEditModalCtrl'
    });

    modalInstance.result.then(function (part){
      $scope.workorder.parts.push(GeneralPartSearchService.manualAddPart(part));
    });
  };

  $scope.getUsedLaborCodes();

  $scope.getTimeElapsed();

  $scope.getTotalLaborTime();

  $scope.getUnaccountedTime();
}]);

angular.module('WorkOrderApp.Controllers').controller('NotesEditModalCtrl',
function ( $scope, $uibModalInstance, notes, ObjectService){
  $scope.notes = notes;

  $scope.changeNoteTextAreaField = function ( changedData, selected ) {
    $scope.notes = changedData;
  };

  $scope.ok = function (){
    $uibModalInstance.close($scope.notes);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaEditModalCtrl',
function ( $scope, $uibModalInstance, jsa, ObjectService ){
  $scope.jsa = jsa;

  $scope.changeJsaTextAreaField = function (changeData, selected) {
    ObjectService.updateNestedObjectValue($scope.jsa, changeData, selected);
  };

  $scope.changeJsaCheckbox = function (changedData, selected) {
    ObjectService.updateNestedObjectValue($scope.jsa, changedData, selected);
  };
  $scope.changeJsaTextField = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.jsa, changedData, selected);
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
  $scope.removeTech = function (tech) {
    var index = $scope.jsa.techinicians.indexOf(tech);
    $scope.jsa.techinicians.splice(index, 1);
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartEditModalCtrl',
function ( $scope, $uibModalInstance, ObjectService){
  $scope.part = {};

  $scope.changePartTextAreaField = function (changedData, selected) {
    ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
  };

  $scope.changePartTextField = function ( changedData, selected ) {
    ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
  };

  $scope.addPart = function (){
    $uibModalInstance.close($scope.part);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function ($scope, $uibModalInstance){
  $scope.ok = function (){
    $uibModalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function ($scope, $uibModalInstance){
  $scope.confirm = function (){
    $uibModalInstance.close(true);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
});
