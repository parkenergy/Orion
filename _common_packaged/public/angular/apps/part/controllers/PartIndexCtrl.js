angular.module('PartApp.Controllers').controller('PartIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'parts', 'role', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, parts, role, ArrayFilterService) {

    $scope.title = "Parts";

    $scope.parts = parts;
    $scope.role = role;

    $scope.editPart = function (id) {
      $location.path("/part/edit/" + (id || ""));
    };

    $scope.createPart = function () {
      $scope.editPart();
    };

    $scope.sort = {
      column: "smartPartNumber",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.searchParts = function (searchPhrase) {
      if(searchPhrase === ""){
        $scope.workorders = parts;
      }
      else{
        ArrayFilterService.filter(parts, searchPhrase, function (err, results) {
          $scope.parts = results;
        });
      }
    };

    /* *************************************************************************
    Table sort and search functionality (TODO: make this a service)
    ************************************************************************* */
    function getTableDisplayColumns () {
      return [ // which columns need to be displayed in the table
        { title: "Number",      objKey: "smartPartNumber" },
        { title: "System",      objKey: "systemName" },
        { title: "Subsystem",   objKey: "subsystemConcatenateName" },
        { title: "Description", objKey: "description" },
      ];
    }

    function getTableColumnSizes () {
      return [ // what size do you want the columns to be (html)
        "col-xs-2", // number
        "col-xs-2", // system
        "col-xs-2", // subsystem
        "col-xs-4 hidden-md hidden-sm hidden-xs", // description (don't show on mobile)
        "col-xs-2", // button
      ];
    }

    function getTableSort () {
      return {
        column: ["smartPartNumber"],
        descending: [false]
      };
    }

    var tableRowAction = function (obj) {
      $scope.editPart(obj._id);
    };

    var tableHeaderAction = function (obj) {
      $scope.createPart();
    };

    function getTableRowButtons () {
      var arr = [];

      var button = {};
      button.title = "edit";
      button.action = function (obj) { return; }; // we want the same functionality as row click action

      arr.push(button);

      return arr;
    }

    function getTableHeaderButtons() {
      var arr = [];

      var button = {};
      button.title = "new part";
      button.action = tableHeaderAction;

      arr.push(button);
      return arr;
    }

    function getNestedDisplayColumns() {
      return [ // which columns need to be displayed in the table
        { title: "Vendor",      objKey: "vendor.name" },
        { title: "Part #",      objKey: "vendorPartNumber" },
        { title: "Description", objKey: "vendorPartDescription" },
        { title: "Cost",        objKey: "vendorPartCost" },
      ];
    }

    $scope.tableModel = {
      tableName: "Parts", // displayed at top of page
      objectList: $scope.parts, // objects to be shown in list
      displayColumns: getTableDisplayColumns(),
      columnSizes: getTableColumnSizes(),
      sort: getTableSort(),
      //rowClickAction: tableRowAction,
      rowButtons: getTableRowButtons(),
      headerButtons: getTableHeaderButtons(),

      nestedTableName: "Vendor Parts",
      nestedKey: "vendorParts",
      nestedDisplayColumns: getNestedDisplayColumns(),

    };

}]);
