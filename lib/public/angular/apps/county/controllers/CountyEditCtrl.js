angular.module('CountyApp.Controllers').controller('CountyEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'Counties', 'county', 'states',
  function ($scope, $route, $location, AlertService, Counties, county, states) {

    $scope.title = county ? "Edit " + county.name :
                              "Create a new county";

    $scope.county = county;
    $scope.states = states;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.county._id) {
        // Edit an existing county.
        Counties.save({_id: county._id}, $scope.county,
          function (response) {
            $location.path("/county");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new county.
        Counties.save({}, $scope.county,
          function (response) {
            $location.path("/county");
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
      Counties.delete({id: county._id},
        function (response) {
          $location.path("/county");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
