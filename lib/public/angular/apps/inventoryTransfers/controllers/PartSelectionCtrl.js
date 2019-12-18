angular
    .module("InventoryTransfersApp.Controllers")
    .controller("PartSelectionCtrl", [
        "$scope",
        "$uibModalInstance",
        "Parts",
        "partSelected",
        function($scope, $uibModalInstance, Parts, partSelected) {
            $scope.part = partSelected.data;
            $scope.searchTerm = partSelected.data.number.toString();
            $scope.results = [];
            $scope.fuse = null;

            Parts.query().$promise.then(function(parts) {
                const options = {
                    shouldSort: true,
                    matchAllTokens: true,
                    threshold: 0.7,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: ["description", "componentName"]
                };

                $scope.fuse = new Fuse(parts, options);

                $scope.searchParts();
            });

            $scope.searchParts = () => {
                if (!$scope.fuse) return;
                $scope.results = $scope.fuse
                    .search($scope.searchTerm)
                    .splice(0, 20);
            };
            $scope.selectPart = selectedPart => {
                $uibModalInstance.close({
                    data: selectedPart,
                    index: partSelected.index
                });
            };

            $scope.cancel = () => {
                $uibModalInstance.dismiss("cancel");
            };
        }
    ]);
