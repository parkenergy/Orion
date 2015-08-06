angular.module('CommonControllers').controller('SessionCtrl',
['$scope', '$http', '$location', '$routeParams', '$window', 'AlertService',
function ($scope, $http, $location, $routeParams, $window, AlertService) {

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
    $http.post("/auth/local", {username: $scope.username, password: "whatever" })
    .success(function(data, status, headers, config) {
      console.log(data)
      console.log(status)
      AlertService.add("info", "Login Successful!", 1000);
      $location.path($scope.fragment || "myaccount");
    }).error(function(data, status, headers, config) {
      AlertService.add("danger", "We couldn't log you in. Please try again.");
    });

	};

	$scope.showLocalLogin = function () {
		$scope.hideLocalLogin = false;
	};

}]);
