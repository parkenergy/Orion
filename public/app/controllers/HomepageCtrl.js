angular.module('Orion.Controllers').controller('HomepageCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
	function ($scope, $route, $location, AlertService, LoaderService) {

		$scope.title = "Park Energy";
		$scope.message = "field asset management";

		$scope.myAccount = function () {
			$location.path('/myaccount');
		};

}]);
