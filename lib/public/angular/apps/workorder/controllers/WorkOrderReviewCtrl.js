angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'TimeDisplayService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'counties', 'applicationtypes',
  function ($window, $scope, $location, $timeout, $modal, $cookies, AlertService, TimeDisplayService, WorkOrders, workorder, units, customers, users, parts, counties, applicationtypes) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;
    $scope.dateStr = new Date(workorder.updated_at.toString()).toString();
    $scope.NoteComment = null;
    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
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
    $scope.getThisUsername = function(){
      var name = $scope.workorder.techId;
      var thisUser = null;
      console.log(

      );
    };

    $scope.getThisUsername();
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
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
    $scope.newNotes = {
        notes: [{
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
          sentTime: new Date(new Date() - 4*24*3600*1000 )
        }]
    }
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
    $scope.newNote = function(){
      // load model object into variable
      var thisNote = newNoteObj();
      // fill object with current contents
      thisNote.comment = $scope.note.comment;
      thisNote.techId = "CAN001";
      thisNote.sentTime = new Date();
      // save will go here.
      $scope.newNotes.notes.push(thisNote);
      // clear note input
      $scope.note.comment = null;
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
