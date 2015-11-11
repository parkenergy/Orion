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
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.engine, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.emissions, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.panel, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.compressor, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.cooler, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      angular.forEach($scope.workorder.laborCodes.vessel, function(code) {
        if (code.hours > 0 || code.minutes > 0) {
          if ($scope.usedLaborCodes.indexOf(code.text) == -1) {
            $scope.usedLaborCodes.push(code.text);
          }
        }
      });
      $timeout(function() {
        $scope.getUsedLaborCodes();
      }, 300);
    };

    $scope.getTimeElapsed = function() {
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
        new Date($scope.workorder.timeSubmitted) :
        new Date();
      var h = String("0" + Math.floor(Math.abs(now - start) / 36e5)).slice(-2);
      var m = String("0" + Math.floor((Math.abs(now - start) / 6e4) % 60)).slice(-2);
      var s = String("0" + Math.floor((Math.abs(now - start) / 1e3) % 60)).slice(-2);
      $scope.timeElapsed = h + ":" + m + ":" + s;
      $timeout(function() {
        $scope.getTimeElapsed();
      }, 300);
    };

    $scope.getTotalLaborTime = function() {
      $scope.totalHours = 0;
      $scope.totalMinutes = 0;
      angular.forEach($scope.workorder.laborCodes.basic, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.engine, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.emissions, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.panel, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.compressor, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.cooler, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      angular.forEach($scope.workorder.laborCodes.vessel, function(code) {
        $scope.totalHours += code.hours;
        $scope.totalMinutes += code.minutes;
      });
      $scope.totalHours -= $scope.workorder.laborCodes.basic.negativeAdj.hours;
      $scope.totalMinutes -= $scope.workorder.laborCodes.basic.negativeAdj.minutes;
      if ($scope.totalMinutes > 60) {
        $scope.totalHours += ($scope.totalMinutes / 60);
        $scope.totalHours = Math.floor($scope.totalHours);
        $scope.totalMinutes = $scope.totalMinutes % 60;
      }
      $timeout(function() {
        $scope.getTotalLaborTime();
      }, 300);
    };

    $scope.getUnaccountedTime = function() {
      var start = new Date($scope.workorder.timeStarted);
      var now = $scope.workorder.timeSubmitted ?
        new Date($scope.workorder.timeSubmitted) :
        new Date();
      var h = String("0" + Math.floor(Math.abs(now - start) / 36e5) - $scope.totalHours - $scope.workorder.laborCodes.basic.negativeAdj.hours).slice(-2);
      var m = String("0" + Math.floor((Math.abs(now - start) / 6e4) % 60) - $scope.totalMinutes - $scope.workorder.laborCodes.basic.negativeAdj.minutes).slice(-2);
      //var s = String("0"+Math.floor((Math.abs(now-start)/1e3)%60)).slice(-2);
      $scope.unaccountedTime = h + ":" + m + ":00";
      $scope.unaccoutedHours = Math.floor(Math.abs(now - start) / 36e5) - $scope.totalHours - $scope.workorder.laborCodes.basic.negativeAdj.hours;
      $scope.unaccountedMinutes = Math.floor((Math.abs(now - start) / 6e4) % 60) - $scope.totalMinutes - $scope.workorder.laborCodes.basic.negativeAdj.minutes;
      $timeout(function() {
        $scope.getUnaccountedTime();
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


    $scope.getUsedLaborCodes();

    $scope.getTimeElapsed();

    $scope.getTotalLaborTime();

    $scope.getUnaccountedTime();
  }
]);
