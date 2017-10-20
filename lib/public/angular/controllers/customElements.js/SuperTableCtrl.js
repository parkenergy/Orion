angular.module('CommonControllers').controller('SuperTableCtrl',
['$scope', 'AlertService',
  function ($scope, AlertService) {

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.filterPart = function (obj, index, fullArrayOfParts) {
      if ($scope.searchPhrase) {
        if ($scope.searchPhrase.length >= 3) {
          const pattern2 = new RegExp($scope.searchPhrase, 'i');
          const mpn = obj.MPN ? obj.MPN : '';
          const desc = obj.description ? obj.description : '';
          const compN = obj.componentName ? obj.componentName : '';
          const full = `${mpn} ${desc} ${compN}`;
          const pattern = new RegExp( '(?=.*\\b' + $scope.searchPhrase.split(' ').join('\\b)(?=.*\\b') + '\\b)', 'i');
          if (mpn.match(pattern) || desc.match(pattern) || compN.match(pattern) || full.match(pattern) || mpn.match(pattern2) || desc.match(pattern2) || compN.match(pattern2) || full.match(pattern2)) {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
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

    $scope.onLoad = function () {
      var m = $scope.model;

      // if the required fields are not present, bail out
      if (!m.objectList || !m.displayColumns) {
        console.log("WARNING!");
        console.log("You failed to provide required data for the directive.");
        console.log("See super-table documentation for more info.");
        var errMessage =  "SuperTabelCtrl: " +
                          "Required attributes were not assigned to model.";
        throw new Error(errMessage);
      } else {
        $scope.tableName = m.tableName || "My Table Name";

        // required variables
        $scope.objectList = m.objectList;
        $scope.displayColumns = m.displayColumns;

        // optional variables
        $scope.rowClickAction = m.rowClickAction;
        $scope.headerButtons = m.headerButtons;
        $scope.rowButtons = m.rowButtons;
        $scope.sort = m.sort || $scope.getDefaultSort();

      }
    };

    $scope.clearSearchPhrase = function(obj){
      $scope.searchPhrase = '';
      var alertString = obj.description + ' added';
      AlertService.add('success',  alertString);
    };

    // call on load
    (function () { $scope.onLoad(); })();

}]);
