angular.module('CompressorApp.Controllers').controller('CompressorIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'compressors',
  function ($scope, $route, $location, AlertService, compressors) {

    $scope.title = "Compressors";

    $scope.compressors = compressors;

    $scope.editCompressor = function (id) {
      $location.path("/compressor/edit/" + (id || ""));
    };

    $scope.createCompressor = function () {
      $scope.editCompressor();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Compressors", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      compressors.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          serial: ele.serial,
          model: ele.model,
          compressorHours: ele.compressorHours,
          unit: ele.unit.number
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Serial #", objKey: "serial" },
        { title: "Model", objKey: "model" },
        { title: "Hours", objKey: "compressorHours" },
        { title: "Unit", objKey: "unit"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCompressor(obj._id);
    }

    function getTableRowButtons () {
      var arr = [];
      var button = {};
      button.title = "edit";
      button.action = rowClickAction;
      arr.push(button);
      return arr;
    }

    function tableHeaderAction () { // takes no parameters
  		$scope.createCompressor();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new compressor";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["serial"],
        descending: [false],
      };
    }

}]);
