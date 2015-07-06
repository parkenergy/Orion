angular.module('CustomerApp.Controllers').controller('CustomerIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'customers',
  function ($scope, $route, $location, AlertService, LoaderService, customers) {

    $scope.title = "Customers";

    $scope.customers = customers;

    $scope.editCustomer = function (id) {
      $location.path("/customer/edit/" + (id || ""));
    };

    $scope.createCustomer = function () {
      $scope.editCustomer();
    };

  	/* Table
  	--------------------------------------------------------------------------- */
    $scope.superTableModel = {
      tableName: "Customers", // displayed at top of page
      objectList: getObjectList(), // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
  		rowClickAction: null, // takes a function that accepts an obj param
      rowButtons: getTableRowButtons(), // an array of button object (format below)
      headerButtons: getTableHeaderButtons(), // an array of button object (format below)
  		sort: getTableSort()
    };

  	function getObjectList () {
  		return customers;
  	}

    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "DBA", objKey: "dbaCustomerName" },
        { title: "Family", objKey: "customerFamily"},
        { title: "Phone", objKey: "phone"}
      ];
    }

    function rowClickAction (obj) { // takes the row object
      $scope.editCustomer(obj._id);
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
  		$scope.createCustomer();
    }

    function getTableHeaderButtons() {
      var arr = [];
      var button = {};
      button.title = "new customer";
      button.action = tableHeaderAction;
      arr.push(button);
      return arr;
    }

    function getTableSort () {
      return {
        column: ["dbaCustomerName"],
        descending: [false],
      };
    }

}]);
