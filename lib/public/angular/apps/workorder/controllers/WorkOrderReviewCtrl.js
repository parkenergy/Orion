angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'workorder', 'ReviewNotes', 'reviewNotes', 'units', 'customers', 'users', 'me', 'parts', 'counties', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, workorder, ReviewNotes, reviewNotes, units, customers, users, me, parts, counties, applicationtypes) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;
    $scope.reviewNotes = reviewNotes;
    $scope.dateStr = new Date(workorder.updated_at.toString()).toString();
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.me = me;
    $scope.parts = parts;
    $scope.counties = counties;
    $scope.applicationtypes = applicationtypes;
    $scope.hours = getHours();
    $scope.minutes = getMinutes();

    $scope.workorderTypes1 = ['Corrective', 'Trouble Call'];
    $scope.workorderTypes2 = ['New Set', 'Release', 'Indirect'];

    // FORMAT TIME
    $scope.totalLaborTime = TimeDisplayService.timeManager($scope.workorder.totalWoTime.hours, $scope.workorder.totalWoTime.minutes);

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

    $scope.partsTableModel = {
      tableName: "Search For Parts", // displayed at top of page
      objectList: parts, // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        {
          title: "Part #",
          objKey: "componentName"
        }, {
          title: "Description",
          objKey: "description"
        }
      ],
      rowClickAction: addPart,
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
      sort: {
        column: ["number"],
        descending: false
      }
    };

    function addPart(part) {
      $scope.workorder.parts.push({
        number: part.number,
        description: part.description,
        cost: 0,
        laborCode: "",
        quantity: 0,
        isBillable: false,
        isWarranty: false
      });
    }
//-----------------------------------------------------------------------
// NOTES
//00000000000000000000000000000000000000000000000000000000000000000000000
// Create an [] to display all notes in database and easily push to on save if saved.

    // init display notes with an empty array.
    $scope.displayNotes = [];
    // the schema is described here for that empty array to be filled with these objects.
    function ClassDisplayNote() {
      var newDisplayNote = {
        firstname: '',
        lastname: '',
        note: '',
        workOrder: null,
        updated_at: Date
      }
      return newDisplayNote;
    }
    // load all notes that are in the database.
    _.map($scope.reviewNotes, function(comment){
      // make sure there is even a comment to look at and that it matches up with this workorder
      if($scope.workorder._id === comment.workOrder){
        // loop through each user and find their first and last name
        _.map($scope.users, function(user){
          if(user.username === comment.user){
            var thisNote = ClassDisplayNote();
            thisNote.firstname = user.firstName;
            thisNote.lastname = user.lastName;
            thisNote.note = comment.note;
            thisNote.updated_at = comment.updated_at;
            $scope.displayNotes.push(thisNote);
          }
        });
      }
    });
//-------------------------------------------------------------------------
// create single object to hold single note to push to the database and the display array if saved correctly.

    // create object model to data bind comment input to.
    $scope.comment = ClassNote();
    // create model object to work off of
    function ClassNote() {
      var newNote = {
        note: '',
        workOrder: $scope.workorder._id
      }
      return newNote;
    }
    // save the new note to the database
    $scope.newNote = function(){
      // save to database will go here only if comment was filled
      if($scope.comment.note){
        // load model object into variable
        var thisNote = ClassNote();
        // fill object with current contents
        thisNote.note = $scope.comment.note;
        // save to database
        console.log("Saving new note...");
        ReviewNotes.save({}, thisNote,
          function (response) {
            console.log(response);
            console.log("success");
            console.log(response.body);
            // save note to display.
            var displayNote = ClassDisplayNote();
            displayNote.firstname = $scope.me.firstName;
            displayNote.lastname = $scope.me.lastName;
            displayNote.note = $scope.comment.note;
            displayNote.updated_at = new Date();
            $scope.displayNotes.unshift(displayNote);
            // clear display note from form
            $scope.comment.note = null;
          },
          function (err) {
            console.log(err);
            console.log("fail");
            $scope.comment.note = null;
          }
        );
        //$scope.databaseNotes.notes.push(thisNote);
      }
      // clear note input
    }
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------

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
      $scope.workorder.netsuiteSyned = true;
      console.log($scope.workorder);
      $scope.allowSubmit = true;
      if($scope.allowSubmit){
        WorkOrders.update({id: $scope.workorder._id}, $scope.workorder,
          function (response) {
            console.log("SUCCESS!!");
            console.log(response);
            AlertService.add("success", "Save was successful!");
            $scope.submitting = false;
            $location.path("/myaccount");
          },
          function (err) {
            console.log("Error Occured!");
            console.log(err);
            AlertService.add("danger", "An error occurred while attempting to save.");
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
  $scope.jsa= jsa;

  $scope.ok = function (){
    $modalInstance.close($scope.jsa);
  };
  $scope.cancel = function (){
    $modalInstance.dismiss('cancel');
  };
});
