angular.module('CommonControllers').controller('SessionCtrl',
['$scope', '$http', '$location', '$routeParams', '$window', 'AlertService', 'Users', '$auth',
function ($scope, $http, $location, $routeParams, $window, AlertService, Users, $auth) {


  $scope.hideLocalLogin = false;
  $scope.title = "Login";
  $scope.message = "Use your local login to access the system.";

	$scope.returnUrl = $routeParams.returnUrl;
	$scope.fragment = $routeParams.fragment;
	$location.search({});

  if($routeParams.failure === "true") {
    AlertService.add("info", "We were unable to log you in. Please try again.");
  }

  $scope.localLogin = function () {
    console.log("localLogin");
    $scope.username = $scope.username.toUpperCase();
    console.log($scope.username);
    AlertService.add("info", "Login Successful!", 1000);
    $location.path($scope.fragment || "myaccount");
	};

  $scope.authenticate = function(provider) {
    console.log("authenticate called");
    $auth.authenticate(provider);
    $location.path('/myaccount');
  };

	$scope.showLocalLogin = function () {
		$scope.hideLocalLogin = false;
	};
}]);
