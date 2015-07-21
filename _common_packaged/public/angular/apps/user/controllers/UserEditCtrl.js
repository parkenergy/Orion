angular.module('UserApp.Controllers').controller('UserEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Users', 'user', 'servicePartners', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, Users, user, servicePartners, role) {

    $scope.title = user ? "Edit " + user.firstName + " " + user.lastName :
                          "Create a new user";

    $scope.user = user;
    $scope.servicePartners = servicePartners;
    if (role === 'ADMIN') {
      $scope.roles = ["TECHNICIAN", "REVIEWER", "CORPORATE", "ADMIN"];
    } else if (role === 'CORPORATE'){
      $scope.roles = ["TECHNICIAN", "REVIEWER", "CORPORATE"];
    } else if (role === 'REVIEWER'){
      $scope.roles = ["TECHNICIAN", "REVIEWER"];
    } else {
      $scope.roles = ["TECHNICIAN"];
    }


    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.user._id) {
        // Edit an existing user.
        Users.save({id: user._id}, $scope.user,
          function (response) {
            $location.path("/user");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new user.
        Users.save({}, $scope.user,
          function (response) {
            $location.path("/user");
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
      Users.delete({id: user._id},
        function (response) {
          $location.path("/user");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
