angular.module('CommonControllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', '$q', '$cookies', 'AlertService', 'LoaderService', 'WorkOrders',
  function ($scope, $route, $location, $q, $cookies, AlertService, LoaderService, WorkOrders) {

    $scope.title = "My Account";
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
      return deferred.promise;
    };
}]);
