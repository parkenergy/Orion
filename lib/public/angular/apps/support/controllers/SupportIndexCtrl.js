angular.module('SupportApp.Controllers').controller('SupportIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'me',
  function ($scope, $route, $location, AlertService, me){
    $scope.me = me;
    $scope.title = "Support";

}]);
