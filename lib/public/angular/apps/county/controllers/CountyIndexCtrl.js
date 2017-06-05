angular.module('CountyApp.Controllers').controller('CountyIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'counties',
  function ($scope, $route, $location, AlertService, counties) {

    $scope.title = "Countys";

    $scope.counties = counties;

    $scope.editCounty = function (id) {
      $location.path("/county/edit/" + (id || ""));
    };

    $scope.createCounty = function () {
      $scope.editCounty();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Counties", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
  		counties.forEach(function (ele, ind, arr) {
        oList.push({_id: ele._id, name: ele.name, state: ele.state.name });
      });
      return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Name", objKey: "name" },
        { title: "State", objKey: "state" }
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCounty(obj._id);
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
  		$scope.createCounty();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new county";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["state", "name"],
        descending: false,
      };
    }

}]);
