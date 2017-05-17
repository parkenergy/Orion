angular.module('CommonControllers').controller('MyAccountCtrl',
['$window', '$scope', 'SessionService',
function ($window, $scope, SessionService) {
  
  const SS =  SessionService;
  // Clear unit parameter from service when routing away from /myaccount
  $window.onhashchange = () => SS.drop("unitNumber");
  
  /* ARS.http.get.UnitWorkOrders({unit: "219", skip: 0, limit: 1})
   .then((res) => {
   console.log(res);
   }, (err) => {
   console.log(err);
   });*/
  // Spinner needs to be on myaccount, dashboard has to load content before
  // loading the view. Might fix later to load spinner first then view.
  $scope.spinner = true;
  $scope.spinnerOff = function (){
    $scope.spinner = false;
  };
  $scope.spinnerOn = function () {
    $scope.spinner = true;
  };
  
}]);
