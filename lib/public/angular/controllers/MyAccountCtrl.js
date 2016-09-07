angular.module('CommonControllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', '$q', '$cookies', 'AlertService', 'LoaderService', 'WorkOrders', 'me',
  function ($scope, $route, $location, $q, $cookies, AlertService, LoaderService, WorkOrders, me) {

    $scope.title = "My Account";
    $cookies.tech = me.username || "Logged Out";
    $scope.spinner = true;
    $scope.spinnerOff = function (){
      $scope.spinner = false;
    };
    $scope.WorkOrderLookup = function (obj) {
      var deferred = $q.defer();
      console.log("Loading workorders...");
      WorkOrders.query(obj,
        function (response) {
          console.log("Workorders loaded");
          return deferred.resolve(response);
        },
        function (err) { return deferred.reject(err); }
      );
      return deferred.promise
    };

    $scope.clickWorkOrder = function () {
        var wo = this.workorder;
        $scope.selected = wo;
        console.log(wo);

        $location.url('/workorder/review/' + wo._id);
      };

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);
