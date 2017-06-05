angular.module('CompressorApp.Controllers').controller('CompressorEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'Compressors', 'compressor', 'units',
  function ($scope, $route, $location, AlertService, Compressors, compressor, units) {

    $scope.title = compressor ? "Edit " + compressor.name : "Create a new compressor";

    $scope.compressor = compressor;
    $scope.units = units;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.compressor._id) {
        // Edit an existing compressor.
        Compressors.save({_id: $scope.compressor._id}, $scope.compressor,
          function (response) {
            $location.path("/compressor");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new compressor.
        Compressors.save({name: $scope.compressor.name}, $scope.compressor,
          function (response) {
            $location.path("/compressor");
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
      Compressors.delete({id: compressor._id},
        function (response) {
          $location.path("/compressor");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
