angular.module('WorkOrderApp.Controllers').controller('WorkOrderIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
function ($scope, $route, $location, AlertService, LoaderService, workorders) {

  $scope.title = "Work Orders";

  $scope.editWorkOrder = function (id) {
    $location.path("/workorder/edit/" + (id || ""));
  };

  $scope.createWorkOrder = function () {
    $scope.editWorkOrder();
  };

	/* Table
	--------------------------------------------------------------------------- */
  $scope.superTableModel = {
    tableName: "Work Orders", // displayed at top of page
    objectList: getObjectList(), // objects to be shown in list
    displayColumns: getTableDisplayColumns(),
		rowClickAction: null, // takes a function that accepts an obj param
    rowButtons: getTableRowButtons(), // an array of button object (format below)
    headerButtons: getTableHeaderButtons(), // an array of button object (format below)
		sort: getTableSort()
  };

	function getObjectList () {
    var oList = [];
		workorders.forEach(function(ele, ind, arr) {
      var obj = {
        _id: ele._id,
        number: ele.number,
        unit: ele.header.unitNumber,
        customer: ele.header.customerName,
        createdBy: (ele.worker === undefined) ? undefined : ele.worker.fullName,
        date: ele.createdOn
      };
      oList.push(obj);
    });
    return oList;
	}

  function getTableDisplayColumns () {
    return [ // which columns need to be displayed in the table
      { title: "WO #", objKey: "number" },
      { title: "Unit", objKey: "unit" },
      { title: "Customer", objKey: "customer" },
      { title: "Created By", objKey: "createdBy" },
      { title: "Date", objKey: "date" }
    ];
  }

  function rowClickAction (obj) { // takes the row object
    $scope.editWorkOrder(obj._id);
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
		$scope.createWorkOrder();
  }

  function getTableHeaderButtons() {
    var arr = [];
    var button = {};
    button.title = "new workorder";
    button.action = tableHeaderAction;
    arr.push(button);
    return arr;
  }

  function getTableSort () {
    return {
      column: ["date", "number"],
      descending: true,
    };
  }

}]);
