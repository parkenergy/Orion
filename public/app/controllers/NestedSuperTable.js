angular.module('Orion.Controllers').controller('NSTCtrl',
['$scope', 'AlertService', 'LoaderService', 'ArrayFilterService',
  function ($scope, AlertService, LoaderService, ArrayFilterService) {

    $scope.expandedRows = [];

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.toggleExpandObject = function (obj) {
      if (obj._nestedObjects) {
        obj.isRowExpanded = !obj.isRowExpanded;
      }
    };


    /* -------------------------------------------------------------------------
    CONFIGURATION / ON LOAD
    ------------------------------------------------------------------------- */
    $scope.getDefaultSort = function () {
      var column = [];
      for (var key in $scope.displayColumns) { column.push(key.toString()); }
      $scope.defaultSort = { column: column, descending: [false] };
    };

    $scope.configureColumnSizes = function () {
      if (!$scope.columnSizes) { $scope.columnSizes = []; }
      var a = $scope.displayColumns.length + $scope.headerButtons.length;
      var b = $scope.displayColumns.length + $scope.rowButtons.length;
      var numberOfColumns = Math.max(a,b);
      for (var i = 0; i < numberOfColumns; i++) {
        $scope.columnSizes[i] = $scope.columnSizes[i] || "col-xs-1";
      }
    };

    $scope.configureNestedObjects = function () {
      $scope.objectList.forEach(function (ele, arr, ind) {

        ele._nestedObjects = [];
        var objects = ele[$scope.nestedKey];
        if (!objects) { ele._nestedObjects = objects; return; }

        objects.forEach(function (obj) {
          var nestedObject = {};
          for (var i = 0; i < $scope.nestedDisplayColumns.length; i++) {
            var key = $scope.nestedDisplayColumns[i].objKey;
            nestedObject[key] = $scope.getNestedKey(obj, key);
          }
          ele._nestedObjects.push(nestedObject);
        });

      });
    };

    $scope.getNestedKey = function (obj, key) {
      if (!obj || !key) { return obj; }

      var keys = key.split('.');
      for (var i = 0; i < keys.length; i++) {
        obj = obj[keys[i]];
        if (!obj) { return undefined;}
      }
      return obj;
    };

    $scope.onLoad = function () {
      var m = $scope.model;
      // if the required fields are not present, bail out
      if (!m.objectList || !m.displayColumns || !m.nestedKey || !m.nestedDisplayColumns) {
        console.log("WARNING!");
        console.log("You failed to provide required data for the directive.");
        console.log("See TableSortSearch documentation for more info.");
        var errMessage =  "TableSortSearchCtrl: " +
                          "Required attributes were not assigned to model.";
        throw new Error(errMessage);
      } else {
        $scope.tableName = m.tableName || "My Table Name";
        $scope.objectList = m.objectList;
        $scope.displayColumns = m.displayColumns;
        $scope.rowClickAction = m.rowClickAction;
        $scope.headerButtons = m.headerButtons;
        $scope.rowButtons = m.rowButtons;
        $scope.sort = m.sort || $scope.getDefaultSort();
        $scope.columnSizes = m.columnSizes;
        $scope.configureColumnSizes();

        $scope.nestedTableName = m.nestedTableName;
        $scope.nestedKey = m.nestedKey;
        $scope.nestedDisplayColumns = m.nestedDisplayColumns;
        $scope.configureNestedObjects();
      }
    };

    // call on load
    (function () { $scope.onLoad(); })();

}]);
