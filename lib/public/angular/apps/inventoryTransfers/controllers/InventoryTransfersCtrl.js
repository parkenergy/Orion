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
        function(
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

            $scope.currentTab = "ManualParts";
            // --------------------------------------------------

            $scope.waitingInventoryTransfers = [];
            $scope.completedInventoryTransfers = [];
            $scope.incompletedInventoryTransfers = [];
            $scope.manualPartsInventoryTransfers = [];

            $scope.openTransfers = function(id) {
                console.log(id);
                $window.open("#/inventory-transfers/" + id);
            };

            $http({
                method: "GET",
                url:
                    "http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/waiting"
            }).then(
                function successCallback(response) {
                    $scope.waitingInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
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
                    "http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/completed"
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.completedInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
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
                    "http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/incomplete"
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.incompletedInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
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
                    "http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/manual_parts"
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.manualPartsInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
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
        }
    ]);
