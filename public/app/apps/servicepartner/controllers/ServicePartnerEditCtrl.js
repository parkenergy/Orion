angular.module('ServicePartnerApp.Controllers').controller('ServicePartnerEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'ServicePartners', 'servicePartner',
  function ($scope, $route, $location, AlertService, LoaderService, ServicePartners, servicePartner) {

    $scope.title = servicePartner ? "Edit " + servicePartner.name :
                                    "Create a new service partner";

    $scope.servicePartner = servicePartner;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.servicePartner._id) {
        // Edit an existing servicePartner.
        ServicePartners.save({id: servicePartner._id}, $scope.servicePartner,
          function (response) {
            $location.path("/servicepartner");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new servicePartner.
        ServicePartners.save({}, $scope.servicePartner,
          function (response) {
            $location.path("/servicepartner");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      ServicePartners.delete({id: servicePartner._id},
        function (response) {
          $location.path("/servicepartner");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
