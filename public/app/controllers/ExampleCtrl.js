angular.module('Orion.Controllers').controller('ExampleCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
	function ($scope, $route, $location, AlertService, LoaderService) {

	$scope.title = "Example";
	$scope.message = "this page shows how to build this app";

	$scope.model = {}; // standard model wrapper

	$scope.list = [{id: 1, text: 'a'}, {id: 2, text: 'b'}, {id: 3, text: 'c'}];

	/* Watch an element for change event
	--------------------------------------------------------------------------- */
	$scope.$watch('model.textField', function (newval, oldval) {
		console.log(newval);
	});

	$scope.$watch('model.isChecked', function (newval, oldval) {
		console.log(newval);
	});

	/* Table
	--------------------------------------------------------------------------- */
  $scope.superTableModel = {
    tableName: "Example Super Table", // displayed at top of page
    objectList: getObjects(), // objects to be shown in list
    displayColumns: getTableDisplayColumns(),
		rowClickAction: rowClickAction, // takes a function that accepts an obj param
    rowButtons: getTableRowButtons(), // an array of button object (format below)
    headerButtons: getTableHeaderButtons(), // an array of button object (format below)
		sort: {
			column: ["field1", "field2"], // takes an array for secondary sort
			descending: [false, true] // takes an array for secondary sort
		}
  };

	function getObjects () {
		var arr = [];
		var letters = ['a','b','c','d','e','f','g','h','i','j'];
		var i = 0;
		while(i < 10) {
			var obj = {
				_id: i, // we arent going to display this
				field1: letters[i],
				field2: letters[9-i],
				field3: i,
				field4: 10-i
			};
			arr.push(obj);
			i++;
		}
		return arr;
	}

  function getTableDisplayColumns () {
    return [ // which columns need to be displayed in the table
      { title: "Field 1", objKey: "field1" },
      { title: "Field 2", objKey: "field2" },
      { title: "Field 3", objKey: "field3" },
      { title: "Field 4", objKey: "field4" },
    ];
  }

  function rowClickAction (obj) { // takes the row object
    /* Example
		----------------------------------------------------------------------------
		if (role === "admin")
			$scope.editObj(obj._id);
		else
			$scope.viewObj(obj._id);
		------------------------------------------------------------------------- */
		alert("you clicked on " + obj._id);
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
    /* Example
		----------------------------------------------------------------------------
		if (role === "admin")
			$scope.create();
		else
			$scope.create();
		------------------------------------------------------------------------- */
		alert("you clicked on the header ");
  }

  function getTableHeaderButtons() {
    var arr = [];
    var button = {};
    button.title = "new part";
    button.action = tableHeaderAction;
    arr.push(button);
    return arr;
  }



	$scope.navigateSomewhere = function () {
		$location.path('/myaccount');
	};

	$scope.infoAlert = function () {
		AlertService.add("info", "This is an info alert!", 1000); // specified timeout
	};

	$scope.warningAlert = function () {
		AlertService.add("warning", "This is an warning alert!"); // default timeout (5000)
	};

	$scope.dangerAlert = function () {
		AlertService.add("danger", "This is a danger alert!");
	};



}]);
