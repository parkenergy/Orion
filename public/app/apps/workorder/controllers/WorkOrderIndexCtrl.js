angular.module('WorkOrderApp.Controllers').controller('WorkOrderIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, workorders, ArrayFilterService) {

    $scope.title = "Work Orders";

    $scope.workorders = workorders;

    $scope.searchPhrase = null;
    $scope.searchLength = null;

    $scope.editWorkOrder = function (id) {
      $location.path("/workorder/edit/" + (id || ""));
    };

    $scope.createWorkOrder = function () {
      $scope.editWorkOrder();
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
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

    $scope.searchWorkorders = function (searchPhrase) {
      console.log(searchPhrase);
      if(searchPhrase === ""){
        $scope.workorders = workorders;
        $scope.onlyShowRecentWorkOrders();
      }
      else{
        ArrayFilterService.filter(workorders, searchPhrase, function (err, results) {
          $scope.workorders = results;
        });
      }
    };

    $scope.onlyShowRecentWorkOrders = function () {
      $scope.workorders = $scope.workorders.filter(function (wo) {
        if (wo.status !== "APPROVED") {
          return true;
        } else {
          var lastChange = new Date(wo.updatedAt);
          var now = new Date();
          var days = daysBetween(lastChange, now);
          if (days > 31) { // if over a month old
            return false;
          } else {
            return true;
          }
        }
      });
    };

    function daysBetween(first, second) {
      // this function courtesy of stack overflow
      // http://stackoverflow.com/questions/1036742/date-difference-in-javascript-ignoring-time-of-day
      // Copy date parts of the timestamps, discarding the time parts.
      var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
      var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

      // Do the math.
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      var millisBetween = two.getTime() - one.getTime();
      var days = millisBetween / millisecondsPerDay;

      // Round down.
      return Math.floor(days);
    }

    (function () { $scope.onlyShowRecentWorkOrders(); })();

}]);
