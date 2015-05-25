angular.module('AreaApp.Controllers').controller('AreaIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'areas',
  function ($scope, $route, $location, AlertService, LoaderService, areas) {

    $scope.title = "Areas";

    $scope.areas = areas;

    $scope.editArea = function (id) {
      $location.path("/area/edit/" + (id || ""));
    };

    $scope.createArea = function () {
      $scope.editArea();
    };

    	/* Table
    	--------------------------------------------------------------------------- */
      $scope.superTableModel = {
        tableName: "Areas", // displayed at top of page
        objectList: getObjectList(), // objects to be shown in list
        displayColumns: getTableDisplayColumns(),
    		rowClickAction: null, // takes a function that accepts an obj param
        rowButtons: getTableRowButtons(), // an array of button object (format below)
        headerButtons: getTableHeaderButtons(), // an array of button object (format below)
    		sort: getTableSort()
      };

    	function getObjectList () {
    		return areas;
    	}

      function getTableDisplayColumns () {
        return [ // which columns need to be displayed in the table
          { title: "Name", objKey: "name" },
          { title: "# Locations", objKey: "locations.length" },
        ];
      }

      function rowClickAction (obj) { // takes the row object
        $scope.editArea(obj._id);
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
    		$scope.createArea();
      }

      function getTableHeaderButtons() {
        var arr = [];
        var button = {};
        button.title = "new area";
        button.action = tableHeaderAction;
        arr.push(button);
        return arr;
      }

      function getTableSort () {
        return {
          column: ["name"],
          descending: [false],
        };
      }

}]);
