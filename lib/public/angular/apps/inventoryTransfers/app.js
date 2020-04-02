angular.module("InventoryTransfersApp.Controllers", []);
angular.module("InventoryTransfersApp.Components", []);
angular.module("InventoryTransfersApp.Directives", []);
angular.module("InventoryTransfersApp.Services", [
    "ngResource",
    "ngCookies",
    "ui.utils"
]);

angular.module("InventoryTransfersApp", [
    "InventoryTransfersApp.Controllers",
    "InventoryTransfersApp.Components",
    "InventoryTransfersApp.Directives",
    "InventoryTransfersApp.Services",
    "infinite-scroll"
]);

angular.module("InventoryTransfersApp").config([
    "$routeProvider",
    function($routeProvider) {
        $routeProvider
            .when("/inventory-transfers", {
                needsLogin: true,
                controller: "InventoryTransfersCtrl",
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/inventoryTransfersOverview.html"
            })
            .when("/inventory-transfers/:id", {
                needsLogin: true,
                controller: "EditInventoryTransferCtrl",
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/editInventoryTransfer.html",
                resolve: {
                    locations: function($route, $q, Locations) {
                        return Locations.query({}).$promise;
                    },
                    inventorytransfer: function(
                        $route,
                        $q,
                        InventoryTransfers
                    ) {
                        const id = $route.current.params.id || 0;
                        return id
                            ? InventoryTransfers.get({ id }).$promise
                            : null;
                    }
                }
            });
    }
]);

angular.module("InventoryTransfersApp").run([
    "$route",
    "$rootScope",
    "$location",
    function($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function(path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on("$locationChangeSuccess", function() {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }
]);
