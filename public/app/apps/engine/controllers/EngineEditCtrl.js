angular.module('EngineApp.Controllers').controller('EngineEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Engines', 'engine',
  function ($scope, $route, $location, AlertService, LoaderService, Engines, engine) {

    $scope.title = engine ? "Edit " + engine.name : "Create a new engine";

    $scope.engine = engine;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.engine._id) {
        // Edit an existing engine.
        Engines.save({_id: $scope.engine._id}, $scope.engine,
          function (response) {
            $location.path("/engine");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new engine.
        Engines.save({name: $scope.engine.name}, $scope.engine,
          function (response) {
            $location.path("/engine");
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
      Engines.delete({_id: engine._id},
        function (response) {
          $location.path("/engine");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
