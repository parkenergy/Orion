angular
    .module("InventoryTransfersApp.Controllers")
    .controller("InventoryTransfersCtrl", [
        "$scope",
        "$http",
        "$window",
        "$timeout",
        "$location",
        "$q",
        "$cookies",
        "AlertService",
        "ApiRequestService",
        "DateService",
        function (
            $scope,
            $http,
            $window,
            $timeout,
            $location,
            $q,
            $cookies,
            AlertService,
            ApiRequestService,
            DateService
        ) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = false;
            $scope.spinner = true;

            $scope.currentTab = "Incomplete";
            $scope.orderByField = "inventorytransferDate";
            $scope.reverseSort = false;

            // --------------------------------------------------

            $scope.waitingInventoryTransfers = [];
            $scope.completedInventoryTransfers = [];
            $scope.incompletedInventoryTransfers = [];

            $scope.openTransfers = function (id) {
                console.log(id);
                $location.path("/inventory-transfers/" + id);
            };

            $scope.updateTable = () => {
                $scope.orderByField = "inventorytransferDate";
                $scope.reverseSort = false;
            };

            $scope.changeSort = (column) => {
                if (column === $scope.orderByField) {
                    $scope.reverseSort = !$scope.reverseSort;
                } else {
                    $scope.orderByField = column;
                }
            };

            $http({
                method: "GET",
                url:
                "https://parkenergyinventory.com:8080/transfers/"/*"http://localhost:8080/api/transfers/"*/ + "waiting/",
            }).then(
                function successCallback(response) {
                    console.log('waiting')
                    console.log(response.data)
                    
                    $scope.waitingInventoryTransfers = response.data.map(
                        (transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        }
                    );
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "https://parkenergyinventory.com:8080/transfers/"/*"http://localhost:8080/api/transfers/"*/ + "completed/",
            }).then(
                function successCallback(response) {
                    console.log('completed')
                    console.log(response.data);

                    $scope.completedInventoryTransfers = response.data.map(
                        (transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        }
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "https://parkenergyinventory.com:8080/transfers/"/*"http://localhost:8080/api/transfers/"*/ + "incomplete/",
            }).then(
                function successCallback(response) {
                    console.log('incomplete')
                    console.log(response.data);

                    $scope.incompletedInventoryTransfers.push(
                        ...response.data.map((transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        })
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "https://parkenergyinventory.com:8080/transfers/"/*"http://localhost:8080/api/transfers/"*/ + "manual_parts/",
            }).then(
                function successCallback(response) {
                    console.log('manual parts')
                    console.log(response.data);

                    $scope.incompletedInventoryTransfers.push(
                        ...response.data.map((transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        })
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );
        },
    ]);
