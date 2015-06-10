angular.module('EngineApp.Controllers').controller('EngineIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'engines',
  function ($scope, $route, $location, AlertService, LoaderService, engines) {

    $scope.title = "Engines";

    $scope.engines = engines;

    $scope.editEngine = function (id) {
      $location.path("/engine/edit/" + (id || ""));
    };

    $scope.createEngine = function () {
      $scope.editEngine();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Engines", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      engines.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          serial: ele.serial,
          model: ele.model,
          engineHours: ele.engineHours,
          unit: ele.unit.number
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Serial #", objKey: "serial" },
        { title: "Model", objKey: "model" },
        { title: "Hours", objKey: "engineHours" },
        { title: "Unit", objKey: "unit"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editEngine(obj._id);
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
  		$scope.createEngine();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new engine";
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
