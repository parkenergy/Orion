angular.module('WorkOrderApp.Controllers').controller('WorkOrderReviewCtrl', ['$window', '$scope', '$location', '$timeout', '$modal', '$cookies', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'counties', 'applicationtypes',
  function($window, $scope, $location, $timeout, $modal, $cookies, AlertService, WorkOrders, workorder, units, customers, users, parts, counties, applicationtypes) {
    $scope.message = "Review Work Order";

    $scope.workorder = workorder;

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

    $scope.usedLaborCodes = [];

    $scope.getUsedLaborCodes = function() {

      angular.forEach($scope.workorder.laborCodes.basic, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.engine, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.emissions, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.panel, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.compressor, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.cooler, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.vessel, function(code) {
        code.highlight=false;
        if (code.hours > 0 || code.minutes > 0) {
          code.highlight=true;
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      $timeout(function() {
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

    $scope.removePart = function(part) {
      var index = $scope.workorder.parts.indexOf(part);
      $scope.workorder.parts.splice(index, 1);
    };

    $scope.openLeaseNotes = function(){
      var modalInstance = $modal.open({
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woLeaseNotesModal.html',
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
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woUnitNotesModal.html',
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
        templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woJsaModal.html',
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

    $scope.getUsedLaborCodes();
  }
]);

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
