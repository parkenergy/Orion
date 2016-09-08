angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'me', 'parts', 'counties', 'states', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, workorder, units, customers, users, me, parts, counties, states, applicationtypes) {

    $scope.message = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    // scope holding objects.
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.me = me;
    $scope.parts = parts;
    $scope.counties = counties;
    $scope.states = states;
    $scope.applicationtypes = applicationtypes;
    $scope.workorder = workorder;

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
    // Array for rideAlong
    $scope.userRideAlongArray = [];

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

    // Auto fill for header information
    $scope.$watch('workorder.header.unitNumber', function (newVal, oldVal) {
      //set $scope.workorder.unit to null if certain params are met.
      if($scope.workorder.unit && (newVal !== oldVal)){
        $scope.workorder.unit = null;
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
        }

        // needed so on page reload the header stays filled.
        if($scope.workorder.unit){
          $scope.workorder.header.state = $scope.workorder.unit.state.name;
          $scope.workorder.header.county = $scope.workorder.unit.county.name;
          $scope.workorder.header.leaseName = $scope.workorder.unit.locationName;
          $scope.workorder.header.customerName = $scope.workorder.unit.customerName;
          $scope.workorder.header.unitNumber = $scope.workorder.unit.number;
        }
      }
      $scope.workorder.unitNumber = $scope.workorder.header.unitNumber;
    });
    /* maybe?
     var resumeWorkOrderId = null;
      workorders.forEach(function (wo) {
        if (!wo.timeSubmitted && wo.technician === $scope.user) {
          console.log('Resume Workorder');
          resumeWorkOrderId = wo._id;
        }
      });
      $location.path("/workorder/edit/" + (resumeWorkOrderId || ''));*/

    // every change calls this watch.
    $scope.$watch('workorder', function (newVal, oldVal) {
      console.log(oldVal);
      console.log(newVal);
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
/*============================================================================ Notes
1. create the mock database data.
2. create new array of objects formatting every item of  the notes database into the correct firstname, lastname , commment, time. and uploading it into a new display array.
3. Take in the new note and submit it to the database and also to the display array. [future]. only if submisison was successful. Resolve Reject.

History
4. create the mock database data.
//-------------------------------------------------------------------------*/
//00000000000000000000000000000000000000000000000000000000000000000000000
// [1]

    // make shift database of notes
    $scope.databaseNotes = {
        notes: [
          {
            techId: "CAN001",
            comment: "Hello world",
            sentTime: new Date(new Date() - 7*24*3600*1000 )
          },
          {
            techId: "JMI001",
            comment: "Hello 2nd world",
            sentTime: new Date(new Date() - 5*24*3600*1000 )
          },
          {
            techId: "CAN001",
            comment: "Hello 3rd world, plus dont forget all the other information that might get posted in here. Must test for a very long message just in case someone would like to post a very extremely long message for some reason. If in fact this message applet can take a large message and if it will display it correctly is very crucial. Will I have to format the messages to fit or will this media applet understand how to cut lines short and go to the very next line with the content.",
            sentTime: new Date(new Date() - 4*24*3600*1000)
          }
        ]
    };
//00000000000000000000000000000000000000000000000000000000000000000000000
// [4]

    // make shift history database
    $scope.databaseHistories = {
      submissions: [
        {
          techId: 'JPU001',
          type: 'Submitted',
          submittedTime: new Date(new Date() - 4*24*3600*1000)
        },
        {
          techId: 'ILA001',
          type: 'Reviewed',
          submittedTime: new Date(new Date() - 3*24*3600*1000)
        },
        {
          techId: 'LMC001',
          type: 'Uploaded',
          submittedTime: new Date(new Date() - 2*24*3600*1000)
        }
      ],
      changes: [{
        elementName: '',
        before: '',
        after: ''
      }]
    };


//00000000000000000000000000000000000000000000000000000000000000000000000
// [2]

    // init display notes with an empty array.
    $scope.displayNotes = {
      notes: []
    }
    // the schema is described here for that empty array to be filled with these objects.
    function newDisplayNoteObj() {
      var newDisplayNote = {
        firstname: '', // firstname: { type: String },
        lastname: '', //  lastname: { type: String },
        comment: '', //   comment: { type: String },
        sentTime: Date // sentTIme: { type: Date }
      }
      return newDisplayNote;
    }
    // load all notes that are in the database.
    $scope.dbnotes = $scope.databaseNotes; // future = $scope.notes = notes;
    _.map($scope.dbnotes.notes, function(note){
      // loop through each user and find their first and last name
      _.map($scope.users, function(user){
        if(user.username === note.techId){
          var thisNote = newDisplayNoteObj();
          thisNote.firstname = user.firstName;
          thisNote.lastname = user.lastName;
          thisNote.comment = note.comment;
          thisNote.sentTime = note.sentTime;
          $scope.displayNotes.notes.push(thisNote);
        }
      });
    });
//-------------------------------------------------------------------------
// NOTES
// [3]
    // create object model to data bind comment input to.
    $scope.note = newNoteObj();

    // create model object to work off of
    function newNoteObj() {
      var newNote = {
        techId: '',
        comment: '',
        sentTime: new Date()
      }
      return newNote;
    }

    // save the new note to the database
    $scope.newNote = function(){
      // only if a note is entered.
      if($scope.note.comment){
        // load model object into variable
        var myNote = newNoteObj();
        // fill object with current contents
        myNote.comment = $scope.note.comment;
        myNote.techId = $scope.me.username;
        myNote.sentTime = new Date();
        // save to display
        var newDisplayNote = newDisplayNoteObj();
        newDisplayNote.firstname = $scope.me.firstName;
        newDisplayNote.lastname = $scope.me.lastName;
        newDisplayNote.comment = myNote.comment;
        newDisplayNote.sentTime = myNote.sentTime;
        $scope.displayNotes.notes.push(newDisplayNote);
        // save to database
        $scope.databaseNotes.notes.push(myNote);
      }
      // clear note input
      $scope.note.comment = null;
    }
//-------------------------------------------------------------------------
// HISTORY

//-------------------------------------------------------------------------


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
