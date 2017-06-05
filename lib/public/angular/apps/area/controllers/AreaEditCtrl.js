angular.module('AreaApp.Controllers').controller('AreaEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'Areas', 'area',
  function ($scope, $route, $location, AlertService, Areas, area) {

    $scope.title = area ? "Edit " + area.name : "Create a new area";

    $scope.area = area;
    $scope.locations = area ? area.locations : null;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.area._id) {
        // Edit an existing area.
        Areas.save({_id: $scope.area._id}, $scope.area,
          function (response) {
            $location.path("/area");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new area.
        Areas.save({name: $scope.area.name}, $scope.area,
          function (response) {
            $location.path("/area");
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
      Areas.delete({id: area._id},
        function (response) {
          $location.path("/area");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
