angular.module('CommonControllers').controller('MyAccountCtrl',
['$scope', '$http', '$route', '$location', '$q', '$cookies', 'AlertService', 'LoaderService', 'WorkOrders',
  function ($scope, $http, $route, $location, $q, $cookies, AlertService, LoaderService, WorkOrders) {

    $scope.title = "My Account";
    $scope.spinner = true;
    $scope.spinnerOff = function (){
      $scope.spinner = false;
    };
    $scope.spinnerOn = function () {
      $scope.spinner = true;
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
    
    $scope.WorkOrderCount = function (obj) {
      var deferred = $q.defer();
      console.log("Getting count...");
      
      $http({method: 'GET', url: '/api/workorderscount', params: obj})
        .then(function (count) {
            console.log("Workorder Count");
            return deferred.resolve(count);
          },
          function (err) {
            return deferred.reject(err);
          });
      
      return deferred.promise;
    };
}]);
