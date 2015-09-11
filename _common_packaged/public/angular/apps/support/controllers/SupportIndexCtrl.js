angular.module('SupportApp.Controllers').controller('SupportIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
  function ($scope, $route, $location, AlertService, LoaderService){

    $scope.title = "Support";

}]);
