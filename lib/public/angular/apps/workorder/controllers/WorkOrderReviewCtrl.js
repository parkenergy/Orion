angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$http', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'CommonWOfunctions', 'WorkOrders', 'Units', 'Users', 'ReviewNotes','EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'me', 'applicationtypes', 'parts',
function ($window, $http, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, CommonWOfunctions, WorkOrders, Units, Users, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, me, applicationtypes, parts) {
  $scope.message = "Review Work Order";

  const ARS = ApiRequestService;
  $scope.workorder = workorder;
  $scope.parts = parts;
  $scope.reviewNotes = reviewNotes;
  $scope.editHistories = editHistories;
  $scope.disabled = true;
  $scope.me = me;
  $scope.hours = getHours();
  $scope.minutes = getMinutes();
  $scope.usedLaborCodes = [];
  $scope.pad = TimeDisplayService.pad;
  $scope.editable = ($cookies.get('role') === 'admin');
  $scope.SyncedToNetsuite = $scope.workorder.timeSynced || $scope.workorder.updated_at;
  $scope.workorderTypes1 = ['Corrective', 'Trouble Call'];
  $scope.workorderTypes2 = ['New Set', 'Release', 'Indirect'];
  // need this to be viewed on review
  $scope.applicationtypes = applicationtypes;
  
  // Set Asset Type and Unit for display only ------------
  if($scope.workorder.unitNumber){
    ARS.Units({regexN: $scope.workorder.unitNumber})
    .then((units) => {
      for(let unit in units){
        if(units.hasOwnProperty(unit)){
          if(units[unit].hasOwnProperty('productSeries')){
            // display unit is used in the google map view + unit checks
            $scope.displayUnit = units[unit];
          }
        }
      }
    })
    .catch((err) => console.log(err));
  }
  // ----------------------------------------------------

  // Add componentName to Pars in WO for listing --------
  $scope.workorder = CommonWOfunctions.addComponentNameToParts($scope.workorder, $scope.parts);
  // ----------------------------------------------------

  // Elapsed time and LC time ---------------------------
  $scope.$watch('workorder', (newVal) => {
    if(newVal && $scope.workorder.hasOwnProperty('totalWoTime')){
      $scope.totalLaborTime = TimeDisplayService.timeManager($scope.workorder.totalWoTime.hours, $scope.workorder.totalWoTime.minutes);
  
    }
  },true);
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
  // ----------------------------------------------------

  // Only show labor codes that are selected ------------
  $scope.getUsedLaborCodes = () => {
    _.forEach($scope.workorder.laborCodes,(lc) => {
      _.forEach(lc,(code) => {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) === -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
    });
    $timeout(() => {
      $scope.getUsedLaborCodes();
    }, 500);
  };
  // ----------------------------------------------------

  // Routing and labor code hours -----------------------
  function getHours() {
    const hours = [];
    for (let i = 0; i <= 24; i++) {
      hours.push(i);
    }
    return hours;
  }

  function getMinutes() {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i);
    }
    return minutes;
  }

  $scope.edit = () => {
    $location.path("/workorder/edit/" + $scope.workorder._id);
  };
  // ----------------------------------------------------
  
  // Set netsuiteSyned false ----------------------------
  const unSync = (workorder) => {
    WorkOrders.update({id: $scope.workorder._id}, workorder,
      (response) => {},
      (err) => {
        console.log(err);
        AlertService.add("danger", "An error occurred while Unsync work order.");
      }
    );
  };
  // ----------------------------------------------------
  
  // NOTES ----------------------------------------------
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
    if ($scope.comment.note) {
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
  // ----------------------------------------------------
  
  // Submissions ----------------------------------------
  // make the display for all submission history
  $scope.displaySubmissions = [];

  //create display class for Submissions
  function ClassSubmission() {
    return {
      type: '',
      firstname: '',
      lastname: '',
      submissionTime: Date
    };
  }

  // only do if tech has submitted wo.
  if ($scope.workorder.timeSubmitted) {
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
  // ----------------------------------------------------
  
  // History Changes ------------------------------------
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
    if ($scope.workorder._id === edit.workOrder) {
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
  if ($scope.editHistories.length !== 0) {
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
  
  // ----------------------------------------------------

  // Submit for approval or to Netsuite -----------------
  $scope.submit = () => {
    let allowSubmit = true;
    console.log("Submitting...");
    if (($cookies.get('role') === "manager") && (!$scope.workorder.managerApproved || !$scope.workorder.timeApproved) && allowSubmit) {
      console.log($scope.workorder);
      
      WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
        (response) => {
          console.log(response);
          AlertService.add("success", "Successfully submitted for admin approval.");
          $location.path("/myaccount");
        },
        (err) => {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to submit.");
        }
      );
    } else if ($cookies.get('role') === "admin" && (!$scope.workorder.managerApproved && !$scope.workorder.timeApproved) && allowSubmit) {
      AlertService.add("info","Will route to dashboard when netsuite returns ID. Otherwise a warning will show here.");
      $scope.workorder.netsuiteSyned = true;
  
      WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
        (response) => {
          console.log(response);
          if(response.netsuiteId !== ""){
            AlertService.add("success", "Successfully synced to netsuite.");
            $location.path("/myaccount");
          } else {
            $scope.workorder.netsuiteSyned = false;
            unSync($scope.workorder);
            AlertService.add("danger", "Not synced to Netsuite, no NSID in response.")
          }
        },
        (err) => {
          console.log(err);
          $scope.workorder.netsuiteSyned = false;
          AlertService.add("danger", "An error occurred while attempting to sync.");
        }
      );
    } else if ($cookies.get('role') === "admin" && $scope.workorder.managerApproved && allowSubmit) {
      if($scope.workorder.type !== 'Indirect'){
        AlertService.add("info","Will route to dashboard when netsuite returns ID. Otherwise a warning will show here.");
        $scope.workorder.netsuiteSyned = true;
        
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          (response) => {
            console.log(response);
            if(response.netsuiteId !== ""){
              AlertService.add("success", "Successfully synced to netsuite.");
              $location.path("/myaccount");
            } else {
              $scope.workorder.netsuiteSyned = false;
              unSync($scope.workorder);
              AlertService.add("danger", "Not synced to Netsuite, no NSID in response.")
            }
          },
          (err) => {
            console.log(err);
            $scope.workorder.netsuiteSyned = false;
            AlertService.add("danger", "An error occurred while attempting to sync.");
          }
        );
      } else { // move indirect wo into netsuite synced group without actually syncing to netsuite
        $scope.workorder.netsuiteSyned = true;
        $scope.workorder.syncedBy = $scope.me.username;
        $scope.workorder.timeSynced = new Date();
        
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          (response) => {
            console.log(response);
            AlertService.add("success", "Successfully saved Indirect work order, not synced to Netsuite.");
            $location.path("/myaccount");
          },
          (err) => {
            console.log(err);
            $scope.workorder.syncedBy = '';
            $scope.workorder.timeSynced = null;
            $scope.workorder.netsuiteSyned = false;
            unSync($scope.workorder);
            AlertService.add("danger", "An error occurred while attempting to save work order.");
          }
        )
      }
    }
  };
  // ----------------------------------------------------
  
  // Modals ---------------------------------------------
  $scope.openLeaseNotes = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLeaseNotesModal.html',
      controller: 'NotesModalCtrl',
      scope: $scope,
      resolve: {
        notes: function () {
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
      templateUrl: '/lib/public/angular/apps/workorder/views/modals/woUnitNotesModal.html',
      controller: 'NotesModalCtrl',
      scope: $scope,
      resolve: {
        notes: function () {
          return $scope.workorder.misc.unitNotes;
        }
      }
    });
    
    modalInstance.result.then((notes) => {
      $scope.workorder.misc.unitNotes = notes;
    });
  };
  
  $scope.openUnitView = () => {
    if($scope.displayUnit !== undefined){
      const modalInstance = $uibModal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLocationModal.html',
        scope: $scope,
        controller: 'woLocationModalCtrl'
      });
    } else {
      AlertService.add("danger","No unit exists on this work order.");
    }
  };
  
  $scope.openJSA = () => {
    const modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/apps/workorder/views/review/modals/woJsaModal.html',
      controller: 'JsaReviewModalCtrl',
      windowClass: 'jsa-modal',
      resolve: {
        jsa: function () {
          return $scope.workorder.jsa;
        }
      }
    });
    
    modalInstance.result.then((jsa) => {
      $scope.workorder.jsa = jsa;
    });
  };
  // ----------------------------------------------------
  $scope.getUsedLaborCodes();
  $scope.getTimeElapsed();
}]);
