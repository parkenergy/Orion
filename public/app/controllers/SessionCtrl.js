angular.module('Orion.Controllers').controller('SessionCtrl',
['$scope', '$http', '$location', '$routeParams', '$window', 'AlertService',
function ($scope, $http, $location, $routeParams, $window, AlertService) {

  $window.location.href = '/auth/parkenergyidentity';

  $scope.hideLocalLogin = false;
  $scope.title = "Login";
  $scope.message = "Use your local login to access the system.";

	$scope.returnUrl = $routeParams.returnUrl;
	$scope.fragment = $routeParams.fragment;
	$location.search({});

  if($routeParams.failure === "true") {
    AlertService.add("info", "We were unable to log you in. Please try again.");
  }

  $scope.thirdPartyAuth = function (authService) {
    var url = '/auth?authService=' + authService +
    ($scope.returnUrl ? "&returnUrl=" + $scope.returnUrl +
    ($scope.fragment ? "&fragment=" + $scope.fragment : "")
    : "&returnUrl=/#/");

    $window.location.href = url;
  };

	$scope.localLogin = function () {
    $http.post("/auth/local", {email: $scope.email, password: $scope.password})
    .success(function(data, status, headers, config) {
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
