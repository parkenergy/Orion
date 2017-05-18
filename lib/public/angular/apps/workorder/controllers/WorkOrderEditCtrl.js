angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'WorkOrders', 'ReviewNotes', 'EditHistories', 'Units', 'Users', 'Customers', 'workorder', 'reviewNotes', 'editHistories', 'assettypes', 'me', 'parts', 'counties', 'states', 'applicationtypes',
function ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, WorkOrders, ReviewNotes, EditHistories,  Units, Users, Customers, workorder, reviewNotes, editHistories, assettypes, me, parts, counties, states, applicationtypes) {
  
  const ARS = ApiRequestService;
  // scope holding objects.
  $scope.me = me;
  $scope.parts = parts;
  $scope.counties = counties;
  $scope.assettypes = assettypes;
  $scope.states = states;
  $scope.applicationtypes = applicationtypes;
  $scope.workorder = workorder;
  $scope.reviewNotes = reviewNotes;
  $scope.editHistories = editHistories;
  $scope.displayAssetType = '';
  $scope.unitNumberArray = [];

  $scope.hours = getHours();
  $scope.minutes = getMinutes();
  $scope.pad = TimeDisplayService.pad;

  // Arrays for individual collecitons
  $scope.customersArray = [];
  $scope.countiesArray = [];
  $scope.statesArray = [];
  // Array for rideAlong and app types
  $scope.userRideAlongArray = [];
  $scope.SyncedToNetsuite = $scope.workorder.timeSynced || $scope.workorder.updated_at;
  
  _.map($scope.counties,(obj) => {
    $scope.countiesArray.push(obj.name);
  });
  _.map($scope.states,(obj) => {
    $scope.statesArray.push(obj.name);
  });
  
  // Return the NSID of referenced AssetType --------
  $scope.getAssetTypeNSID = (name) => {
    let returnId = '';
    _.forEach($scope.assettypes, (doc) => {
      if(name === doc.type){
        returnId =  doc.netsuiteId;
      }
    });
    return returnId;
  };
  // -------------------------------------------------
  
  // Set Asset Type -------------------------------------
  ARS.Units({regexN: $scope.workorder.unitNumber})
    .then((units) => {
      for(let unit in units){
        if(units.hasOwnProperty(unit)){
          if(units[unit].hasOwnProperty('productSeries')){
            $scope.displayAssetType = units[unit].productSeries;
          }
        }
      }
    })
    .catch((err) => console.log(err));
  // ----------------------------------------------------
  
  // Get Asset Type ----------------------------------
  const getAssetTypeNSID = (ps) => {
    _.forEach($scope.assettypes, (asset) => {
      if(asset.type === ps){
        return asset.netsuiteId;
      }
    });
    return null;
  };
  // -------------------------------------------------
  
  // Add componentName to Pars in WO for listing -----
  $scope.workorder = CommonWOfunctions.addComponentNameToParts($scope.workorder, $scope.parts);
  // -------------------------------------------------
  
  // Unit Header info changes -----------------------
  $scope.unitNumberChange = (changedData) => {
    //set $scope.workorder.unit to null if certain params are met.
    if($scope.workorder.unit){
      $scope.workorder.unit = null;
      $scope.workorder.assetType = null;
    }
  
    // Get all units that include the newVal string in their number
    ARS.Units({regexN: changedData})
    .then((units) => {
      // fill the array for typeahead.
      $scope.unitNumberArray = units;
    
      // loop through incoming units and loop through and check
      // to see if any are an exact match on a unit.
      for(let unit in units){
        if(units.hasOwnProperty(unit)){
          if((units[unit].number === changedData) && (typeof units[unit].number === "string")){
          
            const thisUnit = units[unit];
          
            // Fill doc variables
            $scope.workorder.header.state = thisUnit.state=== null ? "" : thisUnit.state.name;
            $scope.workorder.header.county = thisUnit.county === null ? "" : thisUnit.county.name;
            $scope.workorder.header.leaseName = thisUnit.locationName;
            $scope.workorder.header.customerName = thisUnit.customerName;
            $scope.workorder.header.unitNumber = thisUnit.number;
            $scope.workorder.geo = thisUnit.geo;
            $scope.workorder.unitReadings.engineSerial = thisUnit.engineSerial;
            $scope.workorder.unitReadings.compressorSerial = thisUnit.compressorSerial;
            $scope.workorder.assetType = getAssetTypeNSID(thisUnit.productSeries);
            $scope.displayAssetType = thisUnit.productSeries;
            $scope.workorder.jsa.customer = thisUnit.customerName;
            $scope.workorder.jsa.location = thisUnit.locationName;
            $scope.workorder.unit = thisUnit;
          
            // If the unit doesnt exist you get undefined for
            // units[unit].number.
          } else if(units[unit].number !== undefined) {
            $scope.workorder.jsa.customer = '';
            $scope.workorder.jsa.location = '';
          }
        }
      }
    })
    .catch((err) => console.log(err));
  
    $scope.workorder.unitNumber = $scope.workorder.header.unitNumber;
  };
  
  $scope.customerChange = (changedData) => {
    ARS.Customers({regexName: changedData})
      .then((customers) => {
        $scope.customersArray = customers;
      })
      .catch((err) => console.log(err));
  };
  
  $scope.leaseChange = (changedData) => {
    ARS.Units({regexL: changedData})
      .then((units) => {
        $scope.unitLocationArray = units;
      })
      .catch((err) => console.log(err));
  };
  // ------------------------------------------------
  
  // Passed function to Components ------------------
  // select-list
  $scope.changeThisSelectList = (changedData, selected) => {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // typeahead
  $scope.changeThisTypeahead = (changedData, selected) => {
    if(selected === 'header.rideAlong'){
      const name = changedData.toUpperCase();
      ARS.Users({regexName: name})
        .then((users) => {
          const userArray = [];
          if(users.length > 0){
            for(let user in users){
              if(users.hasOwnProperty(user)){
                if(users[user].hasOwnProperty('firstName')){
                  userArray.push(users[user].firstName.concat(" ").concat(users[user].lastName));
                }
              }
            }
            $scope.userRideAlongArray = userArray;
          }
        })
        .catch((err) => console.log(err));
    }
    
    ObjectService.updateNestedObjectValue($scope.workorder,changedData, selected);
  };

  // check-box
  $scope.changeThisCheckbox = (changedData, selected) => {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // text-field
  $scope.changeThisTextField = (changedData, selected) => {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };

  // text-area-field
  $scope.changeThisTextAreaField = (changedData, selected) => {
    ObjectService.updateNestedObjectValue($scope.workorder, changedData, selected);
  };
  // ------------------------------------------------

  // Set time adjustment notes visibility -----------
  $scope.$watch('workorder.laborCodes.basic',() => {
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
  // ------------------------------------------------

  // Indirect Select Logic --------------------------
  $scope.type = [
    { text: "Corrective", value: false },
    { text: "Trouble Call", value: false },
    { text: "New Set", value: false },
    { text: "Release", value: false },
    { text: "Indirect", value: false }
  ];

  // If the object is set to true, set type to that obj, and clear all other types.
  $scope.setTypes = (obj) => {
    if(obj.value === true){
      $scope.workorder.type = obj.text;
      $scope.type.forEach((i) => {
        if(i.text !== obj.text){
          i.value = false;
        }
      });
    }
  };

  $scope.nonPmType = () => {
    if($scope.workorder.pm) $scope.workorder.pm = false;
  };

  // This is ran any time there is a change to the PM checkbox
  $scope.pmChange = (pm) => {
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
  $scope.typeChange = (obj) => {
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
  // ------------------------------------------------
  
  // NOTES ------------------------------------------
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
  $scope.newNote = () => {
    // save to database will go here only if comment was filled
    if($scope.comment.note){
      $scope.sendingNote = true;
      // save to database
      console.log("Saving new note...");
      ReviewNotes.save({}, $scope.comment,
        (response) => {
          $scope.sendingNote = false;
          console.log(response);
          console.log("Successful save.");
          // retrieve notes to display.
          ARS.ReviewNotes({workOrder: response.workOrder})
            .then((newNotes) => {
              $scope.reviewNotes = newNotes;
            })
            .catch((err) => console.log(err));
          // clear display note from form
          $scope.comment.note = null;
        }, (err) => {
          $scope.sendingNote = false;
          console.log(err);
          console.log("Error Saving Note.");
          $scope.comment.note = null;
        }
      );
    }
  };
  
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
    ARS.getUser({id: $scope.workorder.techId})
      .then((user) => {
        let thisUser = user;
        const techSubmission = ClassSubmission();
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
          ARS.getUser({id: $scope.workorder.approvedBy})
            .then((manager) => {
              thisUser = manager;
              const managerSubmission = ClassSubmission();
              managerSubmission.type = "Reviewed";
              managerSubmission.firstname = thisUser.firstName;
              managerSubmission.lastname = thisUser.lastName;
              managerSubmission.submissionTime = $scope.workorder.timeApproved;
              $scope.displaySubmissions.push(managerSubmission);
            })
            .catch((err) => console.log(err));
        }
        // Admin Sync
        if($scope.workorder.timeSynced){
          ARS.getUser({id: $scope.workorder.syncedBy})
            .then((admin) => {
              thisUser = admin;
              const adminSubmission = ClassSubmission();
              adminSubmission.type = "Synced";
              adminSubmission.firstname = thisUser.firstName;
              adminSubmission.lastname = thisUser.lastName;
              adminSubmission.submissionTime = $scope.workorder.timeSynced;
              $scope.displaySubmissions.push(adminSubmission);
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }
  // ------------------------------------------------
  
  // History Changes --------------------------------
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
  _.map($scope.editHistories, (edit) => {
    // format the data correctly for presentation.
    if($scope.workorder._id === edit.workOrder){
      const thisEdit = ClassDisplayHistory();
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
    ARS.getUser({id: $scope.editHistories.pop().user})
      .then((admin) => {
        $scope.editor = admin;
      })
      .catch((err) => {
        console.log('Editor retrieval error');
        console.log(err);
      });
    $scope.editCount = $scope.editHistories.length + 1;
  }
  
  // ------------------------------------------------

  $scope.highMileageConfirm = false;

  $scope.save = () => {
    $scope.submitting = true;
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
          (res) => {
            AlertService.add("success", "Update was successful!");
              $scope.submitting = false;
              console.log($scope.workorder._id);
              $location.url("/workorder/review/" + $scope.workorder._id);
          }, (err) => {
            console.log(err);
              AlertService.add("danger", "An error occurred while attempting to update.");
              $scope.submitting = false;
          }
        );
      }
    }
  };

  $scope.destroy = () => {
    $scope.submitting = true;
    WorkOrders.delete({id: workorder._id},
      (response) => {
        $location.path("/myaccount");
        $scope.submitting = false;
      }, (err) => {
        AlertService.add("error", err);
        $scope.submitting = false;
      }
    );
  };

  $scope.usedLaborCodes = [];
    // set usedLaborCodes array with every used labor code with the text of that labor code
    $scope.getUsedLaborCodes = () => {
      _.forEach($scope.workorder.laborCodes, (lc) => {
        _.forEach(lc, (code) => {
          if (code.hours > 0 || code.minutes > 0) {
            if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
              $scope.usedLaborCodes.push(code.text);
            }
          }
        });
      });
    };

  // TimeDisplayService handles all time display issues with HH:MM
  // refactored 9.5.16
  $scope.getTimeElapsed = () => {
    const start = new Date($scope.workorder.timeStarted);
    const now = $scope.workorder.timeSubmitted ?
      new Date($scope.workorder.timeSubmitted) :
      new Date();
    // e short for elapsed
    $scope.eMilli = (now.getTime() - start.getTime()).toFixed();
    $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60));
    $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)));
    $scope.eHours = Math.floor((($scope.eMilli / (36e5))));
  };

  // get total wo time based on used labor codes
  // refactored 9.5.16
  $scope.getTotalLaborTime = () => {
    $scope.laborH = 0;
    $scope.laborM = 0;
    $scope.totalMinutes = 0;
    _.forEach($scope.workorder.laborCodes, (lc) => {
      _.forEach(lc, (code) => {
        if (code.text === 'Negative Adjustment') {
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
  };

   // get unaccounted for time based on used labor coded and elapsed time FIX
  // refactored 9.5.16
  $scope.getUnaccountedTime = () => {
    $scope.unaccountedM = ($scope.eHours - $scope.laborH)*60;
    $scope.unaccountedM += $scope.eMinutes - $scope.laborM;
    $scope.unaccountedH = parseInt($scope.unaccountedM/60);
    $scope.unaccountedM = Math.round($scope.unaccountedM%60);
    $scope.unaccountedTime = TimeDisplayService.timeManager($scope.unaccountedH,$scope.unaccountedM);
  };
  
  function getHours() {
    const hours = [];
    for (let i = 0; i <= 24; i++) {
      hours.push(i);
    }
    return hours;
  }
  
  function getMinutes() {
    const minutes = [];
    for (let i = 0; i < 60; i += 15) {
      minutes.push(i);
    }
    return minutes;
  }

  /* Populate search field for parts ------------------ */
  parts = parts.map((part) => {
    part.searchStr = [part.description, part.componentName, part.MPN].join(' ');
    return part;
  });

  /* Model for the add part table --------------------- */
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'wo',$scope.workorder);

  $scope.removePart = (part) => {
    const index = $scope.workorder.parts.indexOf(part);
    $scope.workorder.parts.splice(index, 1);
  };

  $scope.openErrorModal = (modalUrl) => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
      controller: 'ErrorCtrl'
    });
  };

  $scope.openConfirmationModal = (modalUrl) => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/' + modalUrl,
      controller: 'ConfirmationCtrl'
    });

    modalInstance.result.then(() => {
      //$scope.allowSubmit = true;
      $scope.highMileageConfirm = true;
      $scope.save();
    });
  };

  $scope.openLeaseNotes = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woLeaseNotesModal.html',
      controller: 'NotesEditModalCtrl',
      resolve: {
        notes: function (){
          return $scope.workorder.misc.leaseNotes;
        }
      }
    });

    modalInstance.result.then((notes) => {
      $scope.workorder.misc.leaseNotes = notes;
    });
  };

  $scope.openUnitNotes = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woUnitNotesModal.html',
      controller: 'NotesEditModalCtrl',
      resolve: {
        notes: function (){
          return $scope.workorder.misc.unitNotes;
        }
      }
    });

    modalInstance.result.then((notes) => {
      $scope.workorder.misc.unitNotes = notes;
    });
  };

  $scope.openJSA = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woJsaModal.html',
      controller: 'JsaEditModalCtrl',
      windowClass: 'jsa-modal',
      resolve: {
        jsa: function (){
          return $scope.workorder.jsa;
        }
      }
    });

    modalInstance.result.then((jsa) => {
      $scope.workorder.jsa = jsa;
    });
  };

  $scope.openManualPartModal = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/edit/modals/woManualAddModal.html',
      controller: 'AddPartEditModalCtrl'
    });

    modalInstance.result.then((part) => {
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

  $scope.changeNoteTextAreaField = ( changedData, selected ) => {
    $scope.notes = changedData;
  };

  $scope.ok = () => {
    $uibModalInstance.close($scope.notes);
  };
  $scope.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('JsaEditModalCtrl',
function ( $scope, $uibModalInstance, jsa, ObjectService ){
  $scope.jsa = jsa;

  $scope.changeJsaTextAreaField = (changeData, selected) => {
    ObjectService.updateNestedObjectValue($scope.jsa, changeData, selected);
  };

  $scope.changeJsaCheckbox = (changedData, selected) => {
    ObjectService.updateNestedObjectValue($scope.jsa, changedData, selected);
  };
  $scope.changeJsaTextField = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.jsa, changedData, selected);
  };

  $scope.ok = () => {
    $uibModalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  };
  $scope.removeTech = (tech) => {
    const index = $scope.jsa.techinicians.indexOf(tech);
    $scope.jsa.techinicians.splice(index, 1);
  };
});

angular.module('WorkOrderApp.Controllers').controller('AddPartEditModalCtrl',
function ( $scope, $uibModalInstance, ObjectService){
  $scope.part = {};

  $scope.changePartTextAreaField = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
  };

  $scope.changePartTextField = ( changedData, selected ) => {
    ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
  };

  $scope.addPart = () => {
    $uibModalInstance.close($scope.part);
  };
  $scope.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
function ($scope, $uibModalInstance){
  $scope.ok = () => {
    $uibModalInstance.close();
  };
});

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
function ($scope, $uibModalInstance){
  $scope.confirm = () => {
    $uibModalInstance.close(true);
  };
  $scope.cancel = () => {
    $uibModalInstance.dismiss('cancel');
  };
});
