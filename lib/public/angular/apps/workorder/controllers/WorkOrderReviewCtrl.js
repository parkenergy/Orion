angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'ReviewNotes','EditHistories', 'workorder', 'reviewNotes', 'editHistories', 'users', 'me',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, ReviewNotes, EditHistories, workorder, reviewNotes, editHistories, users, me) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;
    $scope.reviewNotes = reviewNotes;
    $scope.editHistories = editHistories;
    $scope.users = users;
    $scope.me = me;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    $scope.workorderTypes1 = ['Corrective', 'Trouble Call'];
    $scope.workorderTypes2 = ['New Set', 'Release', 'Indirect'];

    // FORMAT TIME
    $scope.totalLaborTime = TimeDisplayService.timeManager($scope.workorder.totalWoTime.hours, $scope.workorder.totalWoTime.minutes);

    // return user object from id
    function getUser(id){
     for(var i = 0; i < $scope.users.length; i++){
       if($scope.users[i].username === id){
         return $scope.users[i];
       }
     }
    }

    $scope.usedLaborCodes = [];

    $scope.getUsedLaborCodes = function () {
      angular.forEach($scope.workorder.laborCodes,function(lc){
        angular.forEach(lc, function(code){
          code.highlight=false;
          if (code.hours > 0 || code.minutes > 0) {
            code.highlight=true;
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
        i += 15;
      }
      return minutes;
    }

//NOTES
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
    // save the new note to the database
    $scope.newNote = function(){
      // save to database will go here only if comment was filled
      if($scope.comment.note){
        // save to database
        console.log("Saving new note...");
        ReviewNotes.save({}, $scope.comment,
          function (response) {
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
            $scope.comment = null;
          },
          function (err) {
            console.log(err);
            console.log("Error Saving Note.");
            $scope.comment = null;
          }
        );
      }
    }
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
      techSubmission.firstname = thisUser.firstName;
      techSubmission.lastname = thisUser.lastName;
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
        thisUser = $scope.workorder.syncedBy;
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

    $scope.removePart = function (part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openLeaseNotes = function (){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woLeaseNotesModal.html',
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
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woUnitNotesModal.html',
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
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woJsaModal.html',
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

    $scope.submit = function () {
      console.log("Submitting...");
      $scope.submitting = true;
      $scope.workorder.approvedBy = $scope.me.username;
      $scope.workorder.timeApproved = new Date();
      console.log($scope.workorder);
      $scope.allowSubmit = true;
      if($scope.allowSubmit){
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log("SUCCESS!!");
            console.log(response);
            AlertService.add("success", "Successfully submitted for admin approval.");
            $scope.submitting = false;
            $location.path("/myaccount");
          },
          function (err) {
            console.log("Error Occured!");
            console.log(err);
            AlertService.add("danger", "An error occurred while attempting to submit.");
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.getUsedLaborCodes();
  }
]);

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
