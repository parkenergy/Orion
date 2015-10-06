angular.module('LocationApp.Controllers').controller('LocationIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'locations',
  function ($scope, $route, $location, AlertService, LoaderService, locations) {

    $scope.title = "Locations";

    $scope.locations = locations;

    $scope.editLocation = function (id) {
      $location.path("/location/edit/" + (id || ""));
    };

    $scope.createLocation = function () {
      $scope.editLocation();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Locations", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
      var oList = [];
      console.log(locations);
      locations.forEach(function (ele, ind, arr) {
        oList.push({
          _id: ele._id,
          name: ele.name,
          type: ele.locationType,
          customer: ele.customer.dbaCustomerName || null,
          area: (ele.area ? ele.area.name : null )
        });
      });
  		return oList;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Name", objKey: "name" },
        { title: "Type", objKey: "type" },
        { title: "Customer", objKey: "customer" },
        { title: "Area", objKey: "area"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editLocation(obj._id);
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
  		$scope.createLocation();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new location";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["area", "name"],
        descending: [false],
      };
    }

}]);
