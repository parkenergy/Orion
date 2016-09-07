angular.module('SupportApp.Controllers').controller('SupportIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'me',
  function ($scope, $route, $location, AlertService, LoaderService, me){
    $scope.me = me;
    $scope.title = "Support";

}]);
